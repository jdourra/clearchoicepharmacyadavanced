import Link from "next/link"
import { Pill } from "lucide-react"
import { Button } from "@/components/ui/button"
import { staffAuth } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function StaffHeader() {
  const staff = await staffAuth.getCurrentStaff()

  async function handleSignOut() {
    "use server"
    await staffAuth.signOut()
    redirect("/staff/login")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/staff/dashboard" className="flex items-center gap-2">
          <Pill className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">Clear Choice Pharmacy - Staff</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/staff/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
            Dashboard
          </Link>
          <Link href="/staff/prescriptions" className="text-sm font-medium hover:text-primary transition-colors">
            Prescriptions
          </Link>
          <Link href="/staff/orders" className="text-sm font-medium hover:text-primary transition-colors">
            Orders
          </Link>
          <Link href="/staff/patients" className="text-sm font-medium hover:text-primary transition-colors">
            Patients
          </Link>
          <Link href="/staff/inventory" className="text-sm font-medium hover:text-primary transition-colors">
            Inventory
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {staff && (
            <form action={handleSignOut}>
              <Button type="submit" variant="outline" size="sm">
                Sign Out
              </Button>
            </form>
          )}
        </div>
      </div>
    </header>
  )
}
