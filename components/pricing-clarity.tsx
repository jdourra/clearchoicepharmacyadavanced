import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export function AllInInclusions({
  title = "All-in price includes",
  items,
  className,
}: {
  title?: string
  items: readonly string[]
  className?: string
}) {
  return (
    <div className={cn("rounded-xl border bg-muted/30 p-4", className)}>
      <p className="text-sm font-semibold mb-3">{title}</p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
            <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function PricingCompareNote({
  title,
  body,
  className,
}: {
  title: string
  body: string
  className?: string
}) {
  return (
    <div className={cn("rounded-xl border border-primary/15 bg-primary/5 p-5", className)}>
      <p className="font-semibold text-foreground mb-2">{title}</p>
      <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  )
}
