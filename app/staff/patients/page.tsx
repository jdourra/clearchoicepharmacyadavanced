import { redirect } from "next/navigation"
import { staffAuth } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StaffHeader } from "@/components/staff-header"
import { Badge } from "@/components/ui/badge"

export default async function StaffPatientsPage() {
  const staff = await staffAuth.getCurrentStaff()
  if (!staff) redirect("/staff/login")

  const patients = await sql(
    "SELECT p.*, (SELECT count(*) FROM prescriptions WHERE patient_id = p.id) as rx_count, (SELECT count(*) FROM orders WHERE patient_id = p.id) as order_count FROM patients p ORDER BY p.created_at DESC",
    []
  )

  return (
    <div className="flex min-h-screen flex-col">
      <StaffHeader />
      <main className="flex-1 py-12 bg-muted/30">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Patient Directory</h1>
            <p className="text-muted-foreground mt-1">View all registered patients</p>
          </div>
          {patients.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">No patients registered yet</p></CardContent></Card>
          ) : (
            <div className="grid gap-4">
              {patients.map((patient) => (
                <Card key={patient.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{`${patient.first_name} ${patient.last_name}`.trim() || "Name not provided"}</CardTitle>
                        <div className="text-sm text-muted-foreground mt-1">{patient.email}</div>
                      </div>
                      <Badge variant="outline">Patient</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      {patient.phone && <div><div className="font-medium text-muted-foreground">Phone</div><div>{patient.phone}</div></div>}
                      {patient.date_of_birth && <div><div className="font-medium text-muted-foreground">Date of Birth</div><div>{new Date(patient.date_of_birth).toLocaleDateString()}</div></div>}
                      <div><div className="font-medium text-muted-foreground">Prescriptions</div><div>{patient.rx_count}</div></div>
                      <div><div className="font-medium text-muted-foreground">Member Since</div><div>{new Date(patient.created_at).toLocaleDateString()}</div></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
