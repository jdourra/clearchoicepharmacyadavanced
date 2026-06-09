"use client"

import { useState } from "react"
import { StaffNav } from "@/components/staff-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Circle, ExternalLink, FileText, Phone, Settings } from "lucide-react"

export default function EDISetupPage() {
  const [setupStep, setSetupStep] = useState(0)
  const [ediConfig, setEdiConfig] = useState({
    accountNumber: "",
    tradingPartnerId: "",
    connectionMethod: "provider",
    providerName: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  })

  const setupSteps = [
    { title: "Contact Prescription Supply", status: "pending" },
    { title: "Choose EDI Method", status: "pending" },
    { title: "Gather Account Info", status: "pending" },
    { title: "Configure Connection", status: "pending" },
    { title: "Test Orders", status: "pending" },
    { title: "Go Live", status: "pending" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <StaffNav />
      <main className="container mx-auto p-6 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">EDI Setup with Prescription Supply</h1>
          <p className="text-muted-foreground">Configure Electronic Data Interchange for automated ordering</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Progress Steps */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Setup Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {setupSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    {index <= setupStep ? (
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground mt-0.5" />
                    )}
                    <div>
                      <p className={index <= setupStep ? "font-medium" : "text-muted-foreground"}>{step.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Step 1: Contact Prescription Supply
                </CardTitle>
                <CardDescription>Call to request EDI setup and obtain necessary information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertDescription>
                    <strong>Phone:</strong> 1-800-671-7006
                    <br />
                    <strong>Ask for:</strong> EDI Setup Department
                    <br />
                    <strong>What to request:</strong> EDI specifications, trading partner ID, account setup
                  </AlertDescription>
                </Alert>
                <Button onClick={() => setSetupStep(1)}>Mark as Complete</Button>
              </CardContent>
            </Card>

            {/* EDI Method Selection */}
            {setupStep >= 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Step 2: Choose EDI Method
                  </CardTitle>
                  <CardDescription>Select how you want to connect with Prescription Supply</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div
                      className="border rounded-lg p-4 hover:border-primary cursor-pointer"
                      onClick={() => {
                        setEdiConfig({ ...ediConfig, connectionMethod: "provider" })
                        setSetupStep(2)
                      }}
                    >
                      <h3 className="font-semibold mb-1">EDI Service Provider (Recommended)</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Use a third-party service like DataTrans WebEDI
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ✅ Fastest setup • No IT staff needed • $100-300/month
                      </p>
                    </div>

                    <div
                      className="border rounded-lg p-4 hover:border-primary cursor-pointer"
                      onClick={() => {
                        setEdiConfig({ ...ediConfig, connectionMethod: "pharmacy-system" })
                        setSetupStep(2)
                      }}
                    >
                      <h3 className="font-semibold mb-1">Pharmacy Management System</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Use built-in EDI from QS/1, PioneerRx, Liberty, etc.
                      </p>
                      <p className="text-xs text-muted-foreground">✅ Integrated with your system • Usually included</p>
                    </div>

                    <div
                      className="border rounded-lg p-4 hover:border-primary cursor-pointer"
                      onClick={() => {
                        setEdiConfig({ ...ediConfig, connectionMethod: "direct" })
                        setSetupStep(2)
                      }}
                    >
                      <h3 className="font-semibold mb-1">Direct EDI Connection</h3>
                      <p className="text-sm text-muted-foreground mb-2">Connect directly using your own EDI software</p>
                      <p className="text-xs text-muted-foreground">⚠️ Requires IT staff • 4-8 week setup • Advanced</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Account Information */}
            {setupStep >= 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Step 3: Enter Account Information</CardTitle>
                  <CardDescription>Information from Prescription Supply</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label>Prescription Supply Account Number</Label>
                      <Input
                        placeholder="PS123456"
                        value={ediConfig.accountNumber}
                        onChange={(e) => setEdiConfig({ ...ediConfig, accountNumber: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Trading Partner ID / ISA ID</Label>
                      <Input
                        placeholder="From EDI specifications"
                        value={ediConfig.tradingPartnerId}
                        onChange={(e) => setEdiConfig({ ...ediConfig, tradingPartnerId: e.target.value })}
                      />
                    </div>
                    {ediConfig.connectionMethod === "provider" && (
                      <div className="space-y-2">
                        <Label>EDI Provider Name</Label>
                        <Input
                          placeholder="e.g., DataTrans, SPS Commerce"
                          value={ediConfig.providerName}
                          onChange={(e) => setEdiConfig({ ...ediConfig, providerName: e.target.value })}
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>EDI Contact Name</Label>
                      <Input
                        placeholder="Contact at Prescription Supply"
                        value={ediConfig.contactName}
                        onChange={(e) => setEdiConfig({ ...ediConfig, contactName: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button onClick={() => setSetupStep(3)}>Save Configuration</Button>
                </CardContent>
              </Card>
            )}

            {/* Documentation Link */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  EDI Documentation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  View the complete EDI setup guide with detailed instructions, contact information, and troubleshooting
                  tips.
                </p>
                <Button variant="outline" asChild>
                  <a href="/docs/PRESCRIPTION_SUPPLY_EDI_SETUP.md" target="_blank" rel="noreferrer">
                    <FileText className="h-4 w-4 mr-2" />
                    View Full Documentation
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Helpful Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a
                  href="https://datatrans-inc.com/edi-prescription-supply/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  DataTrans WebEDI for Prescription Supply
                </a>
                <a
                  href="https://prescriptionsupply.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Prescription Supply Website
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
