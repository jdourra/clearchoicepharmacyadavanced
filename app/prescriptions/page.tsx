import { redirect } from "next/navigation"

export default function PrescriptionsPage() {
  redirect("/account?tab=prescriptions")
}
