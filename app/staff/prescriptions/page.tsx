import { redirect } from "next/navigation"
import { staffAuth } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { StaffHeader } from "@/components/staff-header"
import { PrescriptionManager } from "@/components/prescription-manager"

export default async function StaffPrescriptionsPage() {
  const staff = await staffAuth.getCurrentStaff()
  if (!staff) redirect("/staff/login")

  const prescriptions = await sql(
    `SELECT rx.*, m.name as med_name, m.generic_name as med_generic, m.strength as med_strength, m.dosage_form as med_form,
     p.first_name as patient_first, p.last_name as patient_last, p.email as patient_email, p.phone as patient_phone
     FROM prescriptions rx LEFT JOIN medications m ON m.id = rx.medication_id LEFT JOIN patients p ON p.id = rx.patient_id ORDER BY rx.created_at DESC`,
    []
  )

  const shaped = prescriptions.map((rx) => ({
    ...rx,
    medications: { name: rx.med_name, generic_name: rx.med_generic, strength: rx.med_strength, form: rx.med_form },
    profiles: { full_name: `${rx.patient_first || ""} ${rx.patient_last || ""}`.trim(), email: rx.patient_email, phone: rx.patient_phone },
  }))

  return (
    <div className="flex min-h-screen flex-col">
      <StaffHeader />
      <main className="flex-1 py-12 bg-muted/30">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Prescription Management</h1>
            <p className="text-muted-foreground mt-1">Review and process patient prescriptions</p>
          </div>
          {shaped.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">No prescriptions to display</p></CardContent></Card>
          ) : (
            <PrescriptionManager prescriptions={shaped} />
          )}
        </div>
      </main>
    </div>
  )
}
