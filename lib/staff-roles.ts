import type { StaffUser } from "@/lib/auth-types"

/** Clinical reviewer role used for the doctor-only portal. */
export const CLINICIAN_ROLE = "clinician"

export function isAdminRole(role: string | null | undefined): boolean {
  return role === "admin"
}

export function isClinicianRole(role: string | null | undefined): boolean {
  return role === CLINICIAN_ROLE || role === "doctor"
}

/** Admin pharmacy staff or clinician can review clinical intakes / Rx PDFs. */
export function canReviewClinicalIntakes(role: string | null | undefined): boolean {
  return isAdminRole(role) || isClinicianRole(role)
}

export function canReviewClinicalIntakesStaff(
  staff: Pick<StaffUser, "role"> | null | undefined
): boolean {
  return Boolean(staff && canReviewClinicalIntakes(staff.role))
}
