"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Stethoscope } from "lucide-react"
import { SiteLogo } from "@/components/site-logo"
import { StaffForgotPasswordForm } from "@/components/staff-forgot-password-form"

export default function DoctorForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <SiteLogo href="/" height={88} priority />
        </div>
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Stethoscope className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Forgot password</CardTitle>
            <CardDescription>We will email a link to the clinician account on file.</CardDescription>
          </CardHeader>
          <CardContent>
            <StaffForgotPasswordForm portal="doctor" loginHref="/doctor/login" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
