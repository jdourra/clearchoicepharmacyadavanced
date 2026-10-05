import { Phone } from "lucide-react"
import { PHARMACY_PHONE_DISPLAY, PHARMACY_PHONE_E164 } from "@/lib/phone"

export function IntakePhysicianCallNotice() {
  return (
    <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">
      <p className="flex items-start gap-2">
        <Phone className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          You will get a phone call from{" "}
          <a href={`tel:${PHARMACY_PHONE_E164}`} className="font-semibold underline">
            {PHARMACY_PHONE_DISPLAY}
          </a>{" "}
          from our physicians to complete your clinical review.
        </span>
      </p>
    </div>
  )
}
