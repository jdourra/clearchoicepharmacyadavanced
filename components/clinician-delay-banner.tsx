import { PHARMACY_PHONE_DISPLAY, PHARMACY_PHONE_TEL_HREF } from "@/lib/phone"

export function ClinicianDelayBanner() {
  return (
    <div className="border-b border-amber-300 bg-amber-50 text-amber-950">
      <div className="max-w-7xl mx-auto px-4 py-2.5 text-sm leading-relaxed">
        <p>
          <strong>Clinician review is delayed about one week</strong> while we assign a new licensed
          provider. You may still submit an intake — we will hold it, with no charge until a clinician
          approves. Approved orders receive a <strong>10% courtesy discount</strong> for the delay.
          Regular prescriptions with an existing Rx can still be filled. Call{" "}
          <a className="font-medium underline underline-offset-2" href={PHARMACY_PHONE_TEL_HREF}>
            {PHARMACY_PHONE_DISPLAY}
          </a>{" "}
          with questions.
        </p>
      </div>
    </div>
  )
}

export function shouldShowClinicianDelayBanner(pathname: string | null): boolean {
  if (!pathname) return false
  if (pathname === "/") return true
  return (
    pathname.startsWith("/weight-loss") ||
    pathname.startsWith("/mens-health") ||
    pathname.startsWith("/iv-rejuvenation") ||
    pathname === "/account"
  )
}
