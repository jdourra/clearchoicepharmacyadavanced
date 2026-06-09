import { redirect } from "next/navigation"
import { staffAuth } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Card } from "@/components/ui/card"
import { StaffNav } from "@/components/staff-nav"
import { Badge } from "@/components/ui/badge"

export default async function StaffInventoryPage() {
  const staff = await staffAuth.getCurrentStaff()
  if (!staff) redirect("/staff/login")

  const medications = await sql("SELECT * FROM medications WHERE is_active = true ORDER BY name", [])

  const calculateSellingPrice = (cost: number, qty = 30) => {
    return (Number(cost) * qty * 1.15 + 5).toFixed(2)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <StaffNav />
      <main className="flex-1 py-8 md:py-12 bg-muted/30">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Medication Inventory</h1>
            <p className="text-muted-foreground mt-1">{medications.length} active medications</p>
          </div>
          <div className="grid gap-4">
            {medications.map((med) => {
              const cost = Number(med.acquisition_cost) || 0
              const price30 = calculateSellingPrice(cost, 30)
              const price90 = calculateSellingPrice(cost, 90)
              return (
                <Card key={med.id} className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{med.name}</h3>
                      <p className="text-sm text-muted-foreground">{med.strength} {med.dosage_form}</p>
                      {med.category && <Badge variant="outline" className="mt-2 capitalize">{med.category}</Badge>}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Acquisition Cost</div>
                      <div className="text-lg font-bold">${cost.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-4 gap-4 mt-4 pt-4 border-t text-sm">
                    <div><div className="text-muted-foreground mb-1">NDC</div><div className="font-mono text-xs">{med.ndc || "N/A"}</div></div>
                    <div><div className="text-muted-foreground mb-1">30-day Price</div><div className="font-semibold text-primary">${price30}</div></div>
                    <div><div className="text-muted-foreground mb-1">90-day Price</div><div className="font-semibold text-primary">${price90}</div></div>
                    <div><div className="text-muted-foreground mb-1">Last Updated</div><div className="text-xs">{new Date(med.updated_at).toLocaleDateString()}</div></div>
                  </div>
                  {med.description && <p className="text-sm text-muted-foreground mt-3">{med.description}</p>}
                </Card>
              )
            })}
          </div>
          {medications.length === 0 && <Card className="p-12 text-center"><p className="text-muted-foreground">No medications found</p></Card>}
        </div>
      </main>
    </div>
  )
}
