import { SiteHeader } from "@/components/site-header"

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 py-12 flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-32 w-96 bg-muted rounded" />
        </div>
      </main>
    </div>
  )
}
