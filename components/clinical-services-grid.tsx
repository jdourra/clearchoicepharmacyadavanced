import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CLINICAL_SERVICES, pathBadgeClass } from "@/lib/clinical-services"
import { cn } from "@/lib/utils"

interface ClinicalServicesGridProps {
  className?: string
  showViewAll?: boolean
}

export function ClinicalServicesGrid({ className, showViewAll = true }: ClinicalServicesGridProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid sm:grid-cols-2 gap-4">
        {CLINICAL_SERVICES.map((service) => {
          const Icon = service.icon
          return (
            <Link key={service.href} href={service.href}>
              <Card className="p-6 h-full border-2 hover:border-primary hover:shadow-lg transition-all group">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <Icon className="h-8 w-8 text-primary shrink-0" />
                  <Badge
                    variant="secondary"
                    className={cn("text-xs font-medium shrink-0", pathBadgeClass(service.pathType))}
                  >
                    {service.pathLabel}
                  </Badge>
                </div>
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                <span className="inline-flex items-center text-sm font-medium text-primary">
                  {service.cta}
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Card>
            </Link>
          )
        })}
      </div>
      {showViewAll && (
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/services" className="text-primary font-medium hover:underline">
            View all clinical programs
          </Link>
        </p>
      )}
    </div>
  )
}
