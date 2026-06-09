import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function PrescriptionsPage() {
  const user = await auth.getCurrentUser()
  if (!user) redirect("/auth/login")

  const prescriptions = await sql(
    `SELECT rx.*, m.name as med_name, m.generic_name, m.strength as med_strength, m.dosage_form
     FROM prescriptions rx LEFT JOIN medications m ON m.id = rx.medication_id
     WHERE rx.patient_id = $1 ORDER BY rx.created_at DESC`,
    [user.id]
  )

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 py-12">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">My Prescriptions</h1>
              <p className="text-muted-foreground mt-1">View and manage your prescriptions</p>
            </div>
            <Button asChild><Link href="/medications"><Plus className="mr-2 h-4 w-4" />New Prescription</Link></Button>
          </div>
          {prescriptions.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground mb-4">{"You don't have any prescriptions yet."}</p><Button asChild><Link href="/medications">Browse Medications</Link></Button></CardContent></Card>
          ) : (
            <div className="grid gap-4">
              {prescriptions.map((rx) => (
                <Card key={rx.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div><CardTitle className="text-xl">{rx.med_name}</CardTitle><div className="text-sm text-muted-foreground mt-1">{rx.med_strength} - {rx.dosage_form}</div></div>
                      <Badge variant={rx.status === "active" ? "default" : rx.status === "filled" ? "secondary" : rx.status === "cancelled" || rx.status === "expired" ? "destructive" : "outline"}>{rx.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div><div className="font-medium text-muted-foreground">Quantity</div><div>{rx.quantity_prescribed} days supply</div></div>
                      <div><div className="font-medium text-muted-foreground">Prescriber</div><div>{rx.prescriber_name || "N/A"}</div></div>
                      <div><div className="font-medium text-muted-foreground">Refills Remaining</div><div>{rx.refills_remaining}</div></div>
                    </div>
                    {rx.notes && <div className="mt-4 pt-4 border-t"><div className="font-medium text-sm text-muted-foreground mb-1">Notes</div><div className="text-sm">{rx.notes}</div></div>}
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
