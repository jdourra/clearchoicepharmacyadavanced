import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

type SiteLogoProps = {
  href?: string | null
  className?: string
  /** Pixel height of the logo image (square source asset). */
  height?: number
  priority?: boolean
}

/** Full Clear Choice Pharmacy wordmark (teal/green mark on black). */
export function SiteLogo({
  href = "/",
  className,
  height = 44,
  priority = false,
}: SiteLogoProps) {
  const image = (
    <Image
      src="/images/ccp-logo.png"
      alt="Clear Choice Pharmacy — Your Affordable Care Pharmacy"
      width={height}
      height={height}
      className={cn("rounded-md object-contain", className)}
      style={{ height, width: height }}
      priority={priority}
    />
  )

  if (!href) return image

  return (
    <Link
      href={href}
      className="inline-flex items-center shrink-0 hover:opacity-90 transition-opacity"
      aria-label="Clear Choice Pharmacy home"
    >
      {image}
    </Link>
  )
}
