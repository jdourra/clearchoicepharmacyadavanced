import Link from "next/link"
import { SiteHeader } from "@/components/site-header"

type LegalPageShellProps = {
  title: string
  children: React.ReactNode
}

export function LegalPageShell({ title, children }: LegalPageShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container max-w-3xl py-12 px-4">
        <p className="text-sm text-muted-foreground mb-2">
          <Link href="/" className="hover:text-primary">Home</Link>
        </p>
        <h1 className="text-3xl font-bold mb-8">{title}</h1>
        <div className="prose prose-slate max-w-none space-y-4 text-muted-foreground">{children}</div>
      </main>
    </div>
  )
}
