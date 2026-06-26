"use client"

import { useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Package,
  User,
  FileText,
  Heart,
  Scale,
  Syringe,
  ArrowRight,
  Stethoscope,
  FlaskConical,
  Activity,
} from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { authFetch, clearSession } from "@/lib/session"
import toast from "react-hot-toast"
import type { Order } from "@/lib/auth-types"
import type {
  ClinicalProgramSubmission,
  PatientPortalData,
  PortalPrescription,
} from "@/lib/patient-portal-types"
import { formatPortalStatus, portalStatusVariant } from "@/lib/patient-portal-types"

interface PatientProfile {
  id: string
  email: string
  name: string
  firstName?: string
  lastName?: string
  phone?: string
  dob?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  created_at: string
}

const TAB_VALUES = ["overview", "orders", "prescriptions", "programs", "profile"] as const

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA",
  "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT",
  "VA", "WA", "WV", "WI", "WY",
]

function programIcon(type: ClinicalProgramSubmission["type"]) {
  switch (type) {
    case "mens_health":
      return Heart
    case "trt":
      return Activity
    case "weight_loss":
      return Scale
    case "iv_rejuvenation":
      return Syringe
    case "rejuvenation_vial":
      return FlaskConical
    case "specialty_pharmacy":
      return Stethoscope
  }
}

export function PatientPortalContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const initialTab = TAB_VALUES.includes(tabParam as (typeof TAB_VALUES)[number])
    ? (tabParam as (typeof TAB_VALUES)[number])
    : "overview"

  const [user, setUser] = useState<PatientProfile | null>(null)
  const [portal, setPortal] = useState<PatientPortalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(initialTab)

  useEffect(() => {
    if (tabParam && TAB_VALUES.includes(tabParam as (typeof TAB_VALUES)[number])) {
      setActiveTab(tabParam as (typeof TAB_VALUES)[number])
    }
  }, [tabParam])

  useEffect(() => {
    async function load() {
      try {
        const meRes = await authFetch("/api/auth/me")
        const meData = await meRes.json()
        if (!meData.user) {
          router.push("/auth/login?redirect=/account")
          return
        }
        setUser(meData.user)

        const portalRes = await authFetch("/api/patient-portal")
        if (portalRes.ok) {
          setPortal(await portalRes.json())
        } else {
          setPortal({ orders: [], prescriptions: [], clinicalPrograms: [] })
        }
      } catch {
        router.push("/auth/login?redirect=/account")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 py-12 flex items-center justify-center">
          <p>Loading your portal...</p>
        </main>
      </div>
    )
  }

  const orders = portal?.orders ?? []
  const prescriptions = portal?.prescriptions ?? []
  const clinicalPrograms = portal?.clinicalPrograms ?? []

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 py-8 md:py-12 bg-muted/30">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-1">Patient portal</p>
            <h1 className="text-3xl md:text-4xl font-bold">Welcome, {user?.firstName || user?.name?.split(" ")[0]}</h1>
            <p className="text-muted-foreground mt-1">
              Orders, prescriptions, and clinical program updates in one place.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-6">
            <TabsList className="flex flex-wrap h-auto gap-1">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
              <TabsTrigger value="prescriptions">Prescriptions ({prescriptions.length})</TabsTrigger>
              <TabsTrigger value="programs">Clinical programs ({clinicalPrograms.length})</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{orders.length}</p>
                    <Button variant="link" className="px-0 h-auto mt-1" onClick={() => setActiveTab("orders")}>
                      View orders
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Prescriptions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{prescriptions.length}</p>
                    <Button
                      variant="link"
                      className="px-0 h-auto mt-1"
                      onClick={() => setActiveTab("prescriptions")}
                    >
                      View prescriptions
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Clinical programs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{clinicalPrograms.length}</p>
                    <Button variant="link" className="px-0 h-auto mt-1" onClick={() => setActiveTab("programs")}>
                      View programs
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Need a refill?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button asChild size="sm" className="w-full">
                      <Link href="/">Search medications</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Prescription prices</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Cash-pay medication lookup and reordering.
                    </p>
                    <Button asChild variant="outline" className="w-full bg-transparent">
                      <Link href="/">
                        Search medications
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Clinical services</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Start or track GLP-1, men&apos;s health, IV, or specialty care.
                    </p>
                    <Button asChild variant="outline" className="w-full bg-transparent">
                      <Link href="/services">
                        Explore programs
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="orders">
              <OrdersTab orders={orders} />
            </TabsContent>

            <TabsContent value="prescriptions">
              <PrescriptionsTab prescriptions={prescriptions} />
            </TabsContent>

            <TabsContent value="programs">
              <ProgramsTab programs={clinicalPrograms} />
            </TabsContent>

            <TabsContent value="profile">
              <ProfileTab user={user} router={router} onUserUpdated={setUser} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

function OrdersTab({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
          <p className="text-muted-foreground mb-6">Search a medication to see pricing and place an order.</p>
          <Button asChild>
            <Link href="/">Search medications</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="font-semibold text-lg">Order #{order.order_number}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString()} at{" "}
                  {new Date(order.created_at).toLocaleTimeString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-xl text-primary">${(order.total_amount || 0).toFixed(2)}</p>
                <div className="flex gap-2 justify-end mt-1">
                  <Badge variant={portalStatusVariant(order.status)}>{formatPortalStatus(order.status)}</Badge>
                  <Badge variant="outline">{formatPortalStatus(order.payment_status)}</Badge>
                </div>
              </div>
            </div>
            {order.items && order.items.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium mb-2">Items</p>
                <ul className="flex flex-col gap-1">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground">
                      {item.drug_name} — Qty {item.quantity} — ${(item.price || 0).toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function PrescriptionsTab({ prescriptions }: { prescriptions: PortalPrescription[] }) {
  if (prescriptions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No prescriptions on file</h3>
          <p className="text-muted-foreground mb-6">
            Prescriptions from your doctor or clinical programs will appear here.
          </p>
          <Button asChild variant="outline" className="bg-transparent">
            <Link href="/">Browse medications</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {prescriptions.map((rx) => (
        <Card key={rx.id}>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl">{rx.medication_name}</CardTitle>
                {(rx.strength || rx.dosage_form) && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {[rx.strength, rx.dosage_form].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
              <Badge variant={portalStatusVariant(rx.status)}>{formatPortalStatus(rx.status)}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              {rx.quantity_prescribed != null && (
                <div>
                  <p className="font-medium text-muted-foreground">Quantity</p>
                  <p>{rx.quantity_prescribed}</p>
                </div>
              )}
              {rx.refills_remaining != null && (
                <div>
                  <p className="font-medium text-muted-foreground">Refills left</p>
                  <p>{rx.refills_remaining}</p>
                </div>
              )}
              {rx.prescriber_name && (
                <div>
                  <p className="font-medium text-muted-foreground">Prescriber</p>
                  <p>{rx.prescriber_name}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ProgramsTab({ programs }: { programs: ClinicalProgramSubmission[] }) {
  if (programs.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Stethoscope className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No clinical program submissions</h3>
          <p className="text-muted-foreground mb-2 max-w-md mx-auto">
            Intakes submitted with <strong>{`your account email`}</strong> will show up here with review status.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Already submitted with a different email? Call (248) 987-6182 to link your records.
          </p>
          <Button asChild>
            <Link href="/services">Explore clinical programs</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {programs.map((program) => {
        const Icon = programIcon(program.type)
        return (
          <Card key={`${program.type}-${program.id}`}>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex gap-4">
                  <Icon className="h-8 w-8 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-lg">{program.title}</p>
                    {program.subtitle && (
                      <p className="text-sm text-muted-foreground">{program.subtitle}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Reference {program.id} · Submitted{" "}
                      {new Date(program.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge variant={portalStatusVariant(program.status)} className="self-start">
                  {formatPortalStatus(program.status)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                A licensed provider or our pharmacy team will update you by email or phone when your status changes.
              </p>
              <Button asChild variant="link" className="px-0 mt-2 h-auto">
                <Link href={program.href}>View program details</Link>
              </Button>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function ProfileTab({
  user,
  router,
  onUserUpdated,
}: {
  user: PatientProfile | null
  router: ReturnType<typeof useRouter>
  onUserUpdated: (user: PatientProfile) => void
}) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [dob, setDob] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [zip, setZip] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    setFirstName(user.firstName || user.name?.split(" ")[0] || "")
    setLastName(user.lastName || user.name?.split(" ").slice(1).join(" ") || "")
    setPhone(user.phone || "")
    setDob(user.dob ? user.dob.split("T")[0] : "")
    setAddress(user.address || "")
    setCity(user.city || "")
    setState(user.state || "")
    setZip(user.zip || "")
  }, [user])

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await authFetch("/api/patient-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, phone, dob, address, city, state, zip }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile")
      }
      onUserUpdated(data.user)
      toast.success("Profile updated successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <User className="h-8 w-8" />
          <div>
            <CardTitle>Profile information</CardTitle>
            <p className="text-sm text-muted-foreground">Update your contact and delivery details</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email || ""} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed here. Clinical intakes are matched to this address—contact the
                pharmacy to update it.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(248) 555-0100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of birth</Label>
              <Input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Street address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="40890 Grand River Ave"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Select value={state || undefined} onValueChange={setState}>
                <SelectTrigger id="state">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map((code) => (
                    <SelectItem key={code} value={code}>
                      {code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP code</Label>
              <Input id="zip" value={zip} onChange={(e) => setZip(e.target.value)} placeholder="48375" />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                await authFetch("/api/auth/signout", { method: "POST" })
                clearSession()
                router.push("/")
              }}
            >
              Sign out
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
