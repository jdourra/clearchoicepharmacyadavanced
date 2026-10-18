"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock } from "lucide-react"
import { SiteLogo } from "@/components/site-logo"
import { StaffResetPasswordForm } from "@/components/staff-reset-password-form"

export default function AdminResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <SiteLogo href="/" height={88} priority />
        </div>
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Choose a new password</CardTitle>
            <CardDescription>Use at least 8 characters. This link works once.</CardDescription>
          </CardHeader>
          <CardContent>
            <StaffResetPasswordForm
              portal="admin"
              loginHref="/admin/login"
              requestHref="/admin/forgot-password"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
