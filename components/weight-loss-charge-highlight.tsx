"use client"

import {
  formatWeightLossDoseLabel,
  getPatientRequestedWeightLossDose,
  getWeightLossChargeSummary,
  isLikelyGlpNaive,
  resolvePatientRequestedBillingKitCount,
} from "@/lib/weight-loss-dose-review"
import { formatWeightLossSupplyFromKitCount } from "@/lib/weight-loss-catalog"

type WeightLossChargeHighlightProps = {
  detail: Record<string, unknown>
  /** When set (doctor prescribing), charge uses this dose instead of intake record. */
  prescribedDoseId?: string
  /** When set (doctor prescribing), charge uses this kit count. */
  prescribedKitCount?: number
  /** Compact = pharmacy fulfillment panel; full = intake header. */
  variant?: "full" | "compact"
}

export function WeightLossChargeHighlight({
  detail,
  prescribedDoseId,
  prescribedKitCount,
  variant = "full",
}: WeightLossChargeHighlightProps) {
  const patientDose = getPatientRequestedWeightLossDose(detail)
  const patientKits = resolvePatientRequestedBillingKitCount(detail)
  const patientQuote = getWeightLossChargeSummary(detail, patientDose?.id, patientKits)
  const chargeKits =
    Number.isFinite(Number(prescribedKitCount)) && Number(prescribedKitCount) > 0
      ? Number(prescribedKitCount)
      : patientKits
  const chargeQuote = getWeightLossChargeSummary(
    detail,
    prescribedDoseId || patientDose?.id,
    chargeKits
  )
  if (!patientQuote && !chargeQuote) return null

  const quote = chargeQuote ?? patientQuote!
  const doseChanged =
    Boolean(prescribedDoseId) &&
    Boolean(patientDose) &&
    prescribedDoseId !== patientDose?.id
  const supplyChanged =
    Number.isFinite(Number(prescribedKitCount)) &&
    Number(prescribedKitCount) > 0 &&
    Number(prescribedKitCount) !== patientKits
  const glpNaive = isLikelyGlpNaive(detail)
  const pad = variant === "compact" ? "px-3 py-2" : "px-3 py-3"

  return (
    <div
      className={`rounded-md border border-amber-500/60 bg-amber-50 text-amber-950 dark:bg-amber-950/40 dark:text-amber-50 ${pad} space-y-2`}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
          Patient selection
        </p>
        <p className="font-semibold text-sm sm:text-base">
          {patientQuote?.programName ?? quote.programName}
          {patientDose ? ` · ${formatWeightLossDoseLabel(patientDose)}` : ""}
        </p>
        <p className="text-sm mt-0.5">
          <span className="font-medium">Supply:</span>{" "}
          {formatWeightLossSupplyFromKitCount(patientKits)}
        </p>
      </div>

      <div className="rounded border border-amber-600/40 bg-white/70 dark:bg-black/20 px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
          {doseChanged || supplyChanged
            ? "Charge for prescribed dose / supply"
            : "Amount to collect at pharmacy"}
        </p>
        <p className="text-2xl font-bold tabular-nums tracking-tight">{quote.chargeLabel}</p>
        <p className="text-xs mt-0.5 opacity-90">
          {quote.timeframeLabel} · {quote.kitBreakdownLabel}
        </p>
        {(doseChanged || supplyChanged) && patientQuote ? (
          <p className="text-xs mt-1 opacity-90">
            Patient selected {formatWeightLossDoseLabel(patientQuote.dose)} ·{" "}
            {formatWeightLossSupplyFromKitCount(patientKits)} for {patientQuote.chargeLabel}.
          </p>
        ) : null}
        {quote.liveVisitNote ? (
          <p className="text-xs mt-1 opacity-80">{quote.liveVisitNote}</p>
        ) : null}
      </div>

      {variant === "full" && glpNaive ? (
        <p className="text-xs opacity-90">
          Little/no prior GLP-1 noted — starter titration often preferred when prescribing.
        </p>
      ) : null}
    </div>
  )
}
