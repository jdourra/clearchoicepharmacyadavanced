import { NextResponse } from "next/server"
import { orders } from "@/lib/auth"
import { sql } from "@/lib/db"
import { getUserIdFromRequest } from "@/lib/server-session"
import type { ClinicalProgramSubmission, PortalPrescription } from "@/lib/patient-portal-types"
import { formatPaymentStatus } from "@/lib/intake-payment-status"

export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const patients = await sql(
      "SELECT id, email FROM patients WHERE id = $1",
      [userId]
    )
    if (patients.length === 0) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    const email = String(patients[0].email).toLowerCase()
    const patientId = String(patients[0].id)
    const intakeMatchSql = "WHERE patient_id = $1 OR LOWER(email) = $2"

    const [userOrders, prescriptionRows, mensHealthRows, trtRows, weightLossRows, ivRows, vialRows, specialtyRows] = await Promise.all([
      orders.getOrdersForPatient(patientId),
      sql(
        `SELECT rx.id, rx.status, rx.quantity_prescribed, rx.refills_remaining, rx.prescriber_name, rx.created_at,
                m.name as med_name, m.strength as med_strength, m.dosage_form
         FROM prescriptions rx
         LEFT JOIN medications m ON m.id = rx.medication_id
         WHERE rx.patient_id = $1
         ORDER BY rx.created_at DESC`,
        [patientId]
      ),
      sql(
        `SELECT id, status, selected_product, selected_billing_plan, payment_status, created_at
         FROM patient_intake
         ${intakeMatchSql}
         ORDER BY created_at DESC`,
        [patientId, email]
      ).catch(() => []),
      sql(
        `SELECT id, status, selected_program, selected_billing_plan, payment_status, created_at
         FROM trt_intake
         ${intakeMatchSql}
         ORDER BY created_at DESC`,
        [patientId, email]
      ).catch(() => []),
      sql(
        `SELECT id, status, selected_program, selected_billing_plan, payment_status, created_at
         FROM weight_loss_intake
         ${intakeMatchSql}
         ORDER BY created_at DESC`,
        [patientId, email]
      ).catch(() => []),
      sql(
        `SELECT id, status, selected_package, selected_package_title, preferred_date, preferred_time_window, created_at
         FROM iv_booking_requests
         ${intakeMatchSql}
         ORDER BY created_at DESC`,
        [patientId, email]
      ).catch(() => []),
      sql(
        `SELECT id, status, selected_vial, selected_vial_title, created_at
         FROM rejuvenation_vial_intakes
         ${intakeMatchSql}
         ORDER BY created_at DESC`,
        [patientId, email]
      ).catch(() => []),
      sql(
        `SELECT id, status, selected_medication, request_type, created_at
         FROM specialty_intake
         ${intakeMatchSql}
         ORDER BY created_at DESC`,
        [patientId, email]
      ).catch(() => []),
    ])

    const prescriptions: PortalPrescription[] = prescriptionRows.map((rx: Record<string, unknown>) => ({
      id: String(rx.id),
      medication_name: String(rx.med_name || "Prescription"),
      strength: rx.med_strength ? String(rx.med_strength) : undefined,
      dosage_form: rx.dosage_form ? String(rx.dosage_form) : undefined,
      status: String(rx.status || "unknown"),
      quantity_prescribed: rx.quantity_prescribed != null ? Number(rx.quantity_prescribed) : undefined,
      refills_remaining: rx.refills_remaining != null ? Number(rx.refills_remaining) : undefined,
      prescriber_name: rx.prescriber_name ? String(rx.prescriber_name) : undefined,
      created_at: String(rx.created_at),
    }))

    const mapProgram = (
      row: Record<string, unknown>,
      base: Omit<ClinicalProgramSubmission, "paymentStatus" | "paymentStatusLabel">
    ): ClinicalProgramSubmission => {
      const paymentStatus =
        row.payment_status != null ? String(row.payment_status) : undefined
      return {
        ...base,
        paymentStatus,
        paymentStatusLabel: paymentStatus ? formatPaymentStatus(paymentStatus) : undefined,
      }
    }

    const clinicalPrograms: ClinicalProgramSubmission[] = [
      ...mensHealthRows.map((row: Record<string, unknown>) =>
        mapProgram(row, {
          type: "mens_health" as const,
          id: String(row.id),
          status: String(row.status),
          title: "Men's Health & ED",
          subtitle: row.selected_product ? String(row.selected_product) : undefined,
          submittedAt: String(row.created_at),
          href: "/mens-health",
        })
      ),
      ...trtRows.map((row: Record<string, unknown>) =>
        mapProgram(row, {
          type: "trt" as const,
          id: String(row.id),
          status: String(row.status),
          title: "Testosterone Replacement Therapy",
          subtitle: row.selected_program ? String(row.selected_program) : undefined,
          submittedAt: String(row.created_at),
          href: "/mens-health/trt/start",
        })
      ),
      ...weightLossRows.map((row: Record<string, unknown>) =>
        mapProgram(row, {
          type: "weight_loss" as const,
          id: String(row.id),
          status: String(row.status),
          title: "Semaglutide & Tirzepatide Weight Loss",
          subtitle: row.selected_program ? String(row.selected_program) : undefined,
          submittedAt: String(row.created_at),
          href: "/weight-loss",
        })
      ),
      ...ivRows.map((row: Record<string, unknown>) => ({
        type: "iv_rejuvenation" as const,
        id: String(row.id),
        status: String(row.status),
        title: "Mobile IV Therapy",
        subtitle: row.selected_package_title
          ? String(row.selected_package_title)
          : row.selected_package
            ? String(row.selected_package)
            : undefined,
        submittedAt: String(row.created_at),
        href: "/iv-rejuvenation",
      })),
      ...vialRows.map((row: Record<string, unknown>) => ({
        type: "rejuvenation_vial" as const,
        id: String(row.id),
        status: String(row.status),
        title: "Rejuvenation Vial Kit",
        subtitle: row.selected_vial_title
          ? String(row.selected_vial_title)
          : row.selected_vial
            ? String(row.selected_vial)
            : undefined,
        submittedAt: String(row.created_at),
        href: "/iv-rejuvenation#vial-menu",
      })),
      ...specialtyRows.map((row: Record<string, unknown>) => ({
        type: "specialty_pharmacy" as const,
        id: String(row.id),
        status: String(row.status),
        title: "Specialty Medicine Program",
        subtitle: row.selected_medication ? String(row.selected_medication) : undefined,
        submittedAt: String(row.created_at),
        href: "/specialty-pharmacy",
      })),
    ].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())

    return NextResponse.json({
      orders: userOrders,
      prescriptions,
      clinicalPrograms,
    })
  } catch (error) {
    console.error("[patient-portal] Error:", error)
    return NextResponse.json({ error: "Failed to load patient portal" }, { status: 500 })
  }
}
