"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AdminHeader } from "@/components/admin-header"
import { AdminMedicationForm } from "@/components/admin-medication-form"
import { Button } from "@/components/ui/button"

export default function AdminNewMedicationPage() {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <AdminHeader />
      <main className="flex-1 py-8">
        <div className="container max-w-3xl">
          <Button asChild variant="ghost" className="mb-6">
            <Link href="/admin/medications">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to medications
            </Link>
          </Button>
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Add medication</h1>
            <p className="text-muted-foreground mt-1">Create a new drug entry in the catalog</p>
          </div>
          <AdminMedicationForm mode="create" />
        </div>
      </main>
    </div>
  )
}
