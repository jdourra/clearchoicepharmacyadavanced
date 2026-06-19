import Link from "next/link"
import { Button } from "@/components/ui/button"

type ServiceBuyButtonProps = {
  href: string
  className?: string
  size?: "default" | "sm" | "lg"
  fullWidth?: boolean
  label?: string
}

export function ServiceBuyButton({
  href,
  className,
  size = "default",
  fullWidth,
  label = "Buy",
}: ServiceBuyButtonProps) {
  return (
    <Button asChild size={size} className={fullWidth ? `w-full ${className ?? ""}` : className}>
      <Link href={href}>{label}</Link>
    </Button>
  )
}
