"use client"

import Link from "next/link"
import { Mail, MapPin, Phone, User, Calendar, Copy, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { PatientProfileSummary } from "@/lib/auth-types"

export function AdminOrderPatientPanel({
  patient,
  patientId,
  panelId = "admin-order-patient-panel",
  highlighted = false,
  payUrl = null,
}: {
  patient: PatientProfileSummary | null
  patientId: string | null
  panelId?: string
  highlighted?: boolean
  payUrl?: string | null
}) {
  const copyPayLink = async () => {
    if (!payUrl) return
    try {
      await navigator.clipboard.writeText(payUrl)
    } catch {
      window.prompt("Copy this payment link:", payUrl)
    }
  }

  if (!patientId) {
    return (
      <Card id={panelId} className={cn(highlighted && "ring-2 ring-primary ring-offset-2")}>
        <CardHeader>
          <CardTitle className="text-lg">Patient</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No patient account linked to this order (guest checkout).
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!patient) {
    return (
      <Card id={panelId} className={cn(highlighted && "ring-2 ring-primary ring-offset-2")}>
        <CardHeader>
          <CardTitle className="text-lg">Patient</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Patient record not found.</p>
        </CardContent>
      </Card>
    )
  }

  const fullName = `${patient.firstName} ${patient.lastName}`.trim()
  const addressParts = [
    patient.addressLine1,
    patient.addressLine2,
    [patient.city, patient.state, patient.zip].filter(Boolean).join(", "),
  ].filter(Boolean)

  return (
    <Card
      id={panelId}
      className={cn(
        "scroll-mt-24 transition-shadow",
        highlighted && "ring-2 ring-primary ring-offset-2 shadow-md"
      )}
    >
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Patient
          </CardTitle>
          <Link
            href={`/admin/customers/${patientId}`}
            className="text-xs text-primary hover:underline"
          >
            View customer profile
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="font-semibold text-lg">{fullName || "—"}</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="flex gap-2">
            <Mail className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-muted-foreground">Email</p>
              <a href={`mailto:${patient.email}`} className="font-medium hover:text-primary">
                {patient.email}
              </a>
            </div>
          </div>
          <div className="flex gap-2">
            <Phone className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-muted-foreground">Phone</p>
              {patient.phone ? (
                <a href={`tel:${patient.phone}`} className="font-medium hover:text-primary">
                  {patient.phone}
                </a>
              ) : (
                <p className="font-medium">—</p>
              )}
            </div>
          </div>
          {patient.dob && (
            <div className="flex gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-muted-foreground">Date of birth</p>
                <p className="font-medium">
                  {new Date(patient.dob).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>
        {addressParts.length > 0 && (
          <div className="flex gap-2 text-sm pt-2 border-t">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-muted-foreground">Address</p>
              {addressParts.map((line, i) => (
                <p key={i} className="font-medium">
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}
        {payUrl ? (
          <div className="pt-3 border-t space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Mobile payment link</p>
            <p className="text-xs break-all text-primary bg-primary/5 rounded-md p-2 font-mono">
              {payUrl}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => void copyPayLink()}>
                <Copy className="h-3.5 w-3.5 mr-1" />
                Copy pay link
              </Button>
              <Button type="button" variant="outline" size="sm" asChild>
                <a href={payUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  Open pay page
                </a>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Send this link by email or text so the patient can pay on their phone.
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
