"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Pill, Package, Users, Settings, FileText, BarChart3, LogOut, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function StaffNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/auth/staff-signout", { method: "POST", credentials: "include" })
    document.cookie = "staff_session_id=; path=/; max-age=0"
    window.location.href = "/staff/login"
  }

  const navItems = [
    { href: "/staff/dashboard", label: "Orders", icon: Package },
    { href: "/staff/prescriptions", label: "Prescriptions", icon: FileText },
    { href: "/staff/inventory", label: "Inventory", icon: Pill },
    { href: "/staff/patients", label: "Patients", icon: Users },
    { href: "/staff/import-medications", label: "Import Meds", icon: Upload },
    { href: "/staff/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/staff/settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/staff/dashboard" className="flex items-center gap-2 font-bold">
            <Pill className="h-5 w-5 text-primary" />
            <span>Staff Portal</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  )
}
