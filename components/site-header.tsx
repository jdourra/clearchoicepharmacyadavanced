"use client"

import Link from "next/link"
import { Pill, ShoppingCart, User, Phone, MapPin, Printer, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import type { User as AuthUser } from "@/lib/auth-types"
import { authFetch, clearSession } from "@/lib/session"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

export function SiteHeader() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const router = useRouter()

  useEffect(() => {
    authFetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user)
        else setUser(null)
      })
      .catch(() => setUser(null))
  }, [])

  const handleSignOut = async () => {
    await authFetch("/api/auth/signout", { method: "POST" })
    clearSession()
    setUser(null)
    window.location.href = "/"
  }

  const serviceLinks = [
    { href: "/mens-health", label: "Men's Health" },
    { href: "/weight-loss", label: "Weight Loss" },
    { href: "/iv-rejuvenation", label: "IV Rejuvenation" },
    { href: "/specialty-pharmacy", label: "Specialty Medicine" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="w-full bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 py-1.5 text-xs sm:text-sm">
          <a
            href="https://maps.google.com/?q=40890+Grand+River+Ave,+Novi,+MI+48375"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:underline"
          >
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span>40890 Grand River Ave, Novi, MI 48375</span>
          </a>
          <a href="tel:248-987-6182" className="flex items-center gap-1.5 hover:underline">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span>(248) 987-6182</span>
          </a>
          <span className="hidden sm:flex items-center gap-1.5">
            <Printer className="h-3.5 w-3.5 shrink-0" />
            <span>Fax: (248) 987-4963</span>
          </span>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Pill className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">Clear Choice Rx</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
            Search Medications
          </Link>
          <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-colors">
            How Pricing Works
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors outline-none">
              Services
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {serviceLinks.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link href={link.href}>{link.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {user && (
            <Link href="/account" className="text-sm font-medium hover:text-primary transition-colors">
              My Orders
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/cart">
              <ShoppingCart className="h-4 w-4" />
            </Link>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Welcome, {user.name.split(" ")[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account">View Your Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/cart">My Cart</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/sign-up">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
