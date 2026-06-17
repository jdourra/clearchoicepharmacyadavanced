"use client"

import Link from "next/link"
import {
  Pill,
  ShoppingCart,
  User,
  Phone,
  MapPin,
  Printer,
  Menu,
} from "lucide-react"
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
    { href: "/", label: "Search medications" },
    { href: "/medications", label: "See how much your medications cost" },
    { href: "/pricing", label: "How pricing works" },
  ]

  const clinicalLinks = [
    { href: "/services", label: "All clinical programs" },
    { href: "/weight-loss", label: "GLP-1 weight loss" },
    { href: "/mens-health", label: "Men's health & ED" },
    { href: "/iv-rejuvenation", label: "IV rejuvenation" },
    { href: "/specialty-pharmacy", label: "Specialty medications" },
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
      <div className="max-w-7xl mx-auto px-4 flex h-16 items-center justify-between gap-2">
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
                  <SheetTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5 text-primary" />
                    Clear Choice Rx
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
                    Clinical services
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

          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity min-w-0">
            <Pill className="h-6 w-6 shrink-0 text-primary" />
            <span className="text-base sm:text-lg font-bold truncate">Clear Choice Rx</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-5">
          <NavHoverMenu label="Medications" links={medicationLinks} menuClassName="w-52" />
          <NavHoverMenu label="Clinical Services" links={clinicalLinks} menuClassName="w-56" />
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
                <Button variant="outline" size="sm" className="gap-2 bg-transparent max-w-[140px]">
                  <User className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline truncate">Welcome, {user.name.split(" ")[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My account</DropdownMenuLabel>
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
