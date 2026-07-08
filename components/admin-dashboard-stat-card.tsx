import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type AdminDashboardStatCardProps = {
  href: string
  title: string
  value: string | number
  icon: LucideIcon
  valueClassName?: string
  subtitle?: string
}

export function AdminDashboardStatCard({
  href,
  title,
  value,
  icon: Icon,
  valueClassName,
  subtitle,
}: AdminDashboardStatCardProps) {
  return (
    <Link href={href} className="block h-full group">
      <Card className="h-full transition-colors hover:border-primary hover:shadow-sm cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </CardHeader>
        <CardContent>
          <div className={cn("text-2xl font-bold", valueClassName)}>{value}</div>
          {subtitle ? (
            <p className="text-xs text-muted-foreground mt-1 group-hover:text-primary transition-colors">
              {subtitle}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-1 group-hover:text-primary transition-colors">
              View →
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
