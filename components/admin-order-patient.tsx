"use client"

import Link from "next/link"
import { Mail, MapPin, Phone, User, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { PatientProfileSummary } from "@/lib/auth-types"

export function AdminOrderPatientPanel({
  patient,
  patientId,
}: {
  patient: PatientProfileSummary | null
  patientId: string | null
}) {
  if (!patientId) {
    return (
      <Card>
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
      <Card>
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Patient
          </CardTitle>
          <Link
            href={`/admin/customers`}
            className="text-xs text-primary hover:underline"
          >
            View customers
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
              <p className="font-medium">{patient.phone || "—"}</p>
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
      </CardContent>
    </Card>
  )
}
