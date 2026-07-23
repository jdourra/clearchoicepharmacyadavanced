"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Stethoscope, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { PRIMARY_PHYSICIAN } from "@/lib/clinical-provider"
import { clearStaffSession } from "@/lib/staff-session"

const NAV = [
  { href: "/doctor/intakes", label: "Patient intakes" },
  { href: "/doctor/change-password", label: "Change password" },
]

export function DoctorShell({
  children,
  title,
  description,
}: {
  children: React.ReactNode
  title: string
  description?: string
}) {
  const pathname = usePathname()

  const handleSignOut = async () => {
    await fetch("/api/auth/staff-signout", { method: "POST", credentials: "include" })
    clearStaffSession()
    window.location.href = "/doctor/login"
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <Stethoscope className="h-6 w-6 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-lg font-semibold leading-tight truncate">Clinician portal</p>
              <p className="text-xs text-muted-foreground truncate">{PRIMARY_PHYSICIAN.name}</p>
            </div>
          </div>
          <nav className="flex items-center gap-3 sm:gap-6 overflow-x-auto">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium whitespace-nowrap transition-colors hover:text-primary",
                  pathname === item.href ||
                    (item.href !== "/doctor/intakes" && pathname.startsWith(`${item.href}/`)) ||
                    (item.href === "/doctor/intakes" && pathname.startsWith("/doctor/intakes"))
                    ? "text-primary"
                    : "text-muted-foreground"
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

      <main className="flex-1 py-8">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">{title}</h1>
            {description && <p className="text-muted-foreground mt-1">{description}</p>}
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
