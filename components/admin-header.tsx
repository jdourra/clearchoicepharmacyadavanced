"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Pill, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { staffAuthFetch, clearStaffSession } from "@/lib/staff-session"

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/medications", label: "Medications" },
  { href: "/admin/intakes", label: "Clinical Intakes" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/messages", label: "Messages" },
]

export function AdminHeader() {
  const pathname = usePathname()

  const handleSignOut = async () => {
    await fetch("/api/auth/staff-signout", { method: "POST", credentials: "include" })
    clearStaffSession()
    window.location.href = "/admin/login"
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Pill className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">Clear Choice Pharmacy - Admin</span>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
                  ? "text-primary"
                  : ""
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Button variant="outline" size="sm" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </header>
  )
}
