"use client"

import Link from "next/link"
import {
  ShoppingCart,
  User,
  Phone,
  MapPin,
  Printer,
  Menu,
} from "lucide-react"
import { SiteLogo } from "@/components/site-logo"
import {
  PHARMACY_FAX_DISPLAY,
  PHARMACY_PHONE_DISPLAY,
  PHARMACY_PHONE_TEL_HREF,
} from "@/lib/phone"
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { NavHoverMenu } from "@/components/nav-hover-menu"

export function SiteHeader() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
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
    setMobileOpen(false)
    window.location.href = "/"
  }

  const medicationLinks = [
    { href: "/prescriptions", label: "Low cost prescriptions" },
    { href: "/medications", label: "See how much your medications cost" },
    { href: "/pricing", label: "How pricing works" },
  ]

  const clinicalLinks = [
    { href: "/services", label: "All services" },
    { href: "/prescriptions", label: "Low cost prescription drugs" },
    { href: "/weight-loss", label: "Semaglutide & Tirzepatide" },
    { href: "/mens-health", label: "Tadalafil, Sildenafil & TRT" },
    { href: "/iv-rejuvenation", label: "Mobile IV therapy" },
    { href: "/specialty-pharmacy", label: "Specialty pharmacy" },
    { href: "/learn", label: "Learn guides" },
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
            <span className="hidden min-[420px]:inline">40890 Grand River Ave, Novi, MI 48375</span>
            <span className="min-[420px]:hidden">Novi, MI</span>
          </a>
          <a href={PHARMACY_PHONE_TEL_HREF} className="flex items-center gap-1.5 hover:underline">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span>{PHARMACY_PHONE_DISPLAY}</span>
          </a>
          <span className="hidden sm:flex items-center gap-1.5">
            <Printer className="h-3.5 w-3.5 shrink-0" />
            <span>Fax: {PHARMACY_FAX_DISPLAY}</span>
          </span>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 flex h-[4.5rem] sm:h-20 items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {mounted ? (
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden shrink-0"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[min(100vw-2rem,320px)] p-0">
                <SheetHeader className="border-b px-4 py-4 text-left">
                  <SheetTitle asChild>
                    <div>
                      <SiteLogo href="/" height={56} />
                    </div>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col px-2 py-4 overflow-y-auto max-h-[calc(100vh-5rem)]">
                  <div className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Prescription prices
                  </div>
                  {medicationLinks.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className="rounded-md px-3 py-3 text-sm font-medium hover:bg-muted transition-colors"
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}

                  <div className="px-3 pt-4 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Services
                  </div>
                  {clinicalLinks.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className="rounded-md px-3 py-3 text-sm font-medium hover:bg-muted transition-colors"
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}

                  {user ? (
                    <>
                      <div className="my-3 border-t" />
                      <SheetClose asChild>
                      <Link
                        href="/account"
                        className="rounded-md px-3 py-3 text-sm font-medium hover:bg-muted transition-colors"
                      >
                        Patient portal
                      </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/dashboard"
                          className="rounded-md px-3 py-3 text-sm font-medium hover:bg-muted transition-colors"
                        >
                          Dashboard
                        </Link>
                      </SheetClose>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="rounded-md px-3 py-3 text-left text-sm font-medium text-destructive hover:bg-muted transition-colors"
                      >
                        Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="my-3 border-t" />
                      <SheetClose asChild>
                        <Link
                          href="/auth/login"
                          className="rounded-md px-3 py-3 text-sm font-medium hover:bg-muted transition-colors"
                        >
                          Login
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/auth/sign-up"
                          className="mx-3 mt-2 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                        >
                          Sign up
                        </Link>
                      </SheetClose>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden shrink-0"
              aria-label="Open menu"
              type="button"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          <SiteLogo href="/" height={64} priority />
        </div>

        <nav className="hidden md:flex items-center gap-5">
          <NavHoverMenu label="Medications" links={medicationLinks} menuClassName="w-56" />
          <NavHoverMenu label="Services" links={clinicalLinks} menuClassName="w-56" />
          {mounted && user && (
            <Link href="/account" className="text-sm font-medium hover:text-primary transition-colors">
              Patient portal
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          <Button asChild variant="ghost" size="icon" className="shrink-0">
            <Link href="/cart" aria-label="Cart">
              <ShoppingCart className="h-4 w-4" />
            </Link>
          </Button>

          {!mounted ? (
            <div className="hidden sm:block h-8 w-[148px]" aria-hidden />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent max-w-[min(100%,16rem)]">
                  <User className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline truncate" title={user.name}>
                    Welcome, {user.name}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <span className="block font-semibold truncate">{user.name}</span>
                  <span className="block text-xs font-normal text-muted-foreground truncate">{user.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account">Patient portal</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/cart">My cart</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button asChild size="sm" className="hidden sm:flex">
                <Link href="/auth/sign-up">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
