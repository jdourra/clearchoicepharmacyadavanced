"use client"

import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavHoverMenuProps {
  label: string
  links: { href: string; label: string }[]
  menuClassName?: string
}

/** SSR-stable desktop nav dropdown (no Radix) to avoid hydration mismatches. */
export function NavHoverMenu({ label, links, menuClassName }: NavHoverMenuProps) {
  return (
    <div className="relative group">
      <button
        type="button"
        className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors outline-none"
        aria-haspopup="true"
        aria-expanded={false}
      >
        {label}
        <ChevronDown className="h-4 w-4" />
      </button>
      <div
        className={cn(
          "absolute left-0 top-full z-50 pt-1 opacity-0 invisible pointer-events-none",
          "group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto",
          "group-focus-within:opacity-100 group-focus-within:visible group-focus-within:pointer-events-auto"
        )}
      >
        <div
          className={cn(
            "rounded-md border bg-popover text-popover-foreground shadow-md py-1 min-w-[13rem]",
            menuClassName
          )}
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-3 py-2 text-sm hover:bg-muted transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
