import {
  formatWeightLossDoseLabel,
  getWeightLossChargeSummary,
  resolveWeightLossBillingKitCount,
  resolveWeightLossDoseIdFromDetail,
} from "@/lib/weight-loss-dose-review"
import { getWeightLossDose, getWeightLossProgram } from "@/lib/weight-loss-catalog"
import { PRIMARY_PHYSICIAN } from "@/lib/clinical-provider"
import { getReminderDaysAfterFulfillment, getSupplyPeriodDays } from "@/lib/supply-reminder-schedule"

export type TherapyCheckInSummary = {
  id: string
  monthIndex: number
  monthLabel: string
  sentAt: string | null
  respondedAt: string | null
  tolerating: boolean | null
  weightLostLbs: number | null
  sideEffects: string | null
  notes: string | null
}

export type TherapyMonthRow = {
  key: string
  intakeId: string
  serviceType: "weight_loss"
  monthIndex: number
  monthLabel: string
  periodStart: string
  periodEnd: string
  medication: string
  doseLabel: string
  weeklyDose: string
  weeksCovered: string
  doctorName: string
  kitsInOrder: number
  kitNumber: number
  kitsRemainingAfterMonth: number
  refillsRemainingLabel: string
  monthCostLabel: string
  orderTotalLabel: string
  paymentStatus: string
  status: string
  checkIn: TherapyCheckInSummary | null
}

export type TherapyTimelineResult = {
  patientName: string
  email: string
  rows: TherapyMonthRow[]
  nextRefillAt: string | null
  refillReminderDue: boolean
}

function addDays(iso: string | Date, days: number): Date {
  const d = new Date(iso)
  d.setUTCDate(d.getUTCDate() + days)
  return d
}

function monthLabelFromDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })
}

function money(n: number): string {
  return `$${n.toFixed(2)}`
}

/** Expand one weight-loss intake into month rows (1 kit = ~4 weeks). */
export function expandWeightLossIntakeToMonths(params: {
  intake: Record<string, unknown>
  prescription?: Record<string, unknown> | null
  checkIns?: TherapyCheckInSummary[]
}): TherapyMonthRow[] {
  const { intake, prescription, checkIns = [] } = params
  const intakeId = String(intake.id)
  const programId = String(intake.selected_program ?? "")
  const program = getWeightLossProgram(programId)
  const doseId = resolveWeightLossDoseIdFromDetail(intake)
  const dose = getWeightLossDose(programId, doseId)
  const kits = Math.max(1, resolveWeightLossBillingKitCount(intake))
  const charge = getWeightLossChargeSummary(intake, doseId)
  const orderTotal = charge?.quote.totalBilled ?? 0
  const monthCost = kits > 0 ? orderTotal / kits : orderTotal

  const startRaw =
    intake.supply_cycle_started_at ??
    intake.updated_at ??
    intake.created_at ??
    new Date().toISOString()
  const cycleStart = new Date(String(startRaw))

  const doctorName =
    (prescription?.prescriber_name != null && String(prescription.prescriber_name).trim()) ||
    PRIMARY_PHYSICIAN.name

  const medication =
    (prescription?.medication_name != null && String(prescription.medication_name).trim()) ||
    (program?.name ? `Compounded ${program.name}` : "Weight loss therapy")

  const doseLabel = dose
    ? formatWeightLossDoseLabel(dose)
    : String(prescription?.strength ?? doseId)
  const weeklyDose = dose ? `${dose.weeklyMg} mg weekly` : doseLabel

  const checkInByMonth = new Map(checkIns.map((c) => [c.monthIndex, c]))

  const rows: TherapyMonthRow[] = []
  for (let i = 0; i < kits; i++) {
    const periodStart = addDays(cycleStart, i * 28)
    const periodEnd = addDays(cycleStart, (i + 1) * 28 - 1)
    const remaining = Math.max(0, kits - i - 1)
    rows.push({
      key: `${intakeId}-m${i}`,
      intakeId,
      serviceType: "weight_loss",
      monthIndex: i,
      monthLabel: monthLabelFromDate(periodStart),
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      medication,
      doseLabel,
      weeklyDose,
      weeksCovered: `Weeks ${i * 4 + 1}–${i * 4 + 4} · 4 weekly injections`,
      doctorName,
      kitsInOrder: kits,
      kitNumber: i + 1,
      kitsRemainingAfterMonth: remaining,
      refillsRemainingLabel:
        remaining === 0
          ? "Last kit in this order — reorder next"
          : `${remaining} kit${remaining === 1 ? "" : "s"} left in this order`,
      monthCostLabel: money(monthCost),
      orderTotalLabel: money(orderTotal),
      paymentStatus: String(intake.payment_status ?? "none"),
      status: String(intake.status ?? ""),
      checkIn: checkInByMonth.get(i) ?? null,
    })
  }
  return rows
}

export function computeNextRefillMeta(intake: Record<string, unknown>): {
  nextRefillAt: string | null
  refillReminderDue: boolean
} {
  const start = intake.supply_cycle_started_at
  if (!start) return { nextRefillAt: null, refillReminderDue: false }
  const billingPlan = String(intake.selected_billing_plan ?? "monthly")
  const kits = resolveWeightLossBillingKitCount(intake)
  const supplyDays = getSupplyPeriodDays({
    serviceType: "weight_loss",
    billingPlan,
    billingKitCount: kits,
  })
  const reminderAfter = getReminderDaysAfterFulfillment(supplyDays)
  const dueAt = addDays(String(start), reminderAfter)
  const cycleEnd = addDays(String(start), supplyDays)
  return {
    nextRefillAt: cycleEnd.toISOString(),
    refillReminderDue: Date.now() >= dueAt.getTime() && !intake.refill_reminder_sent_at,
  }
}
