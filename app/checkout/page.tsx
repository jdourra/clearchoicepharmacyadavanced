"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload, Check, Stethoscope } from "lucide-react"
import Link from "next/link"
import { authFetch } from "@/lib/session"
import { hydrateCartItems, type CartItem } from "@/lib/cart"

export default function CheckoutPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [deliveryMethod, setDeliveryMethod] = useState("pickup")
  const [prescriptionMethod, setPrescriptionMethod] = useState("upload")
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null)
  const [doctorName, setDoctorName] = useState("")
  const [doctorPhone, setDoctorPhone] = useState("")
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  })

  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    loadCart()
    // Check auth but don't require it - allow guest checkout
    authFetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setUser(d.user)
          setFormData((prev) => ({
            ...prev,
            firstName: d.user.firstName || d.user.name?.split(" ")[0] || "",
            lastName: d.user.lastName || d.user.name?.split(" ").slice(1).join(" ") || "",
            email: d.user.email || "",
            phone: d.user.phone || prev.phone,
            dob: d.user.dob ? d.user.dob.split("T")[0] : prev.dob,
            address: d.user.address || prev.address,
            city: d.user.city || prev.city,
            state: d.user.state || prev.state,
            zip: d.user.zip || prev.zip,
          }))
        }
      })
      .catch(() => {})
  }, [])

  const loadCart = async () => {
    try {
      const cart = window.sessionStorage.getItem("cart")
      if (!cart) {
        router.push("/cart")
        return
      }

      const rawItems = JSON.parse(cart)
      const items = await hydrateCartItems(Array.isArray(rawItems) ? rawItems : [])
      if (items.length === 0) {
        router.push("/cart")
        return
      }

      setCartItems(items)
      window.sessionStorage.setItem("cart", JSON.stringify(items))
    } catch {
      router.push("/cart")
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0), 0)
  const deliveryFee = deliveryMethod === "delivery" ? 5 : 0
  const total = subtotal + deliveryFee

  const handleSubmit = async () => {
    setLoading(true)

    try {
      const orderItems = cartItems.map((item) => ({
        medication_name: item.medication?.name || "Unknown medication",
        quantity: item.quantity || 1,
        unit_price: item.price || 0,
      }))

 const res = await authFetch("/api/patient-orders", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: orderItems,
          total_amount: total,
          delivery_method: deliveryMethod,
          notes:
            prescriptionMethod === "eprescribe"
              ? `Delivery: ${deliveryMethod}, Prescription: E-Prescribe, Doctor: ${doctorName}, Doctor Phone: ${doctorPhone}`
              : `Delivery: ${deliveryMethod}, Prescription: Upload`,
        }),
      })

      const data = await res.json()
      console.log("[v0] Order response:", JSON.stringify(data))
      if (!res.ok || !data.order) {
        throw new Error(data.error || "Order creation failed")
      }
      window.sessionStorage.removeItem("cart")
      router.push(`/confirmation?orderId=${data.order.id}&orderNumber=${data.order.order_number}`)
    } catch (err: any) {
      console.log("[v0] Order error:", err.message)
      setLoading(false)
      alert("Failed to place order. Please try again.")
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB")
        return
      }
      const validTypes = ["image/jpeg", "image/png", "application/pdf"]
      if (!validTypes.includes(file.type)) {
        alert("Please upload a JPG, PNG, or PDF file")
        return
      }
      setPrescriptionFile(file)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 py-8 md:py-12 bg-muted/30">
        <div className="container max-w-5xl mx-auto px-4">
          <Button asChild variant="ghost" className="mb-6">
            <Link href="/cart">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to cart
            </Link>
          </Button>

          <h1 className="text-3xl md:text-4xl font-bold mb-8">Checkout</h1>

          {/* Progress steps */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= num ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step > num ? <Check className="h-5 w-5" /> : num}
                </div>
                {num < 4 && <div className={`w-16 h-1 ${step > num ? "bg-primary" : "bg-muted"}`} />}
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {step === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Patient Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="dob">Date of Birth</Label>
                      <Input
                        id="dob"
                        type="date"
                        value={formData.dob}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="zip">ZIP Code</Label>
                        <Input
                          id="zip"
                          value={formData.zip}
                          onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <Button onClick={() => setStep(2)} className="w-full" size="lg">
                      Continue to Prescription
                    </Button>
                  </CardContent>
                </Card>
              )}

              {step === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Prescription Upload</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <RadioGroup value={prescriptionMethod} onValueChange={setPrescriptionMethod}>
                      <div className="flex items-start space-x-3 border rounded-lg p-4">
                        <RadioGroupItem value="upload" id="upload" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="upload" className="font-semibold cursor-pointer">
                            Upload Your Prescription
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Take a photo or upload a PDF of your prescription
                          </p>
                          {prescriptionMethod === "upload" && (
                            <div className="mt-4">
                              <input
                                type="file"
                                id="prescription-file"
                                accept=".jpg,.jpeg,.png,.pdf"
                                onChange={handleFileUpload}
                                className="hidden"
                              />
                              <label
                                htmlFor="prescription-file"
                                className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer block"
                              >
                                <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                                {prescriptionFile ? (
                                  <div>
                                    <p className="text-sm font-medium mb-1 text-green-600">
                                      {"+ "}
                                      {prescriptionFile.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      ({(prescriptionFile.size / 1024).toFixed(0)}KB) - Click to change
                                    </p>
                                  </div>
                                ) : (
                                  <div>
                                    <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
                                    <p className="text-xs text-muted-foreground">JPG, PNG, or PDF (max 10MB)</p>
                                  </div>
                                )}
                              </label>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 border rounded-lg p-4">
                        <RadioGroupItem value="eprescribe" id="eprescribe" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="eprescribe" className="font-semibold cursor-pointer">
                            {"Have Your Doctor E-Prescribe"}
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Your doctor will send the prescription directly to us
                          </p>
                          {prescriptionMethod === "eprescribe" && (
                            <div className="mt-4 space-y-4">
                              <div className="bg-muted/50 rounded-lg p-4 text-sm">
                                <p className="font-semibold mb-2">Clear Choice Pharmacy</p>
                                <p className="text-muted-foreground">40890 Grand River Ave, Novi, MI 48375</p>
                                <p className="text-muted-foreground">Phone: (248) 987-6182</p>
                                <p className="text-muted-foreground">Fax: (248) 987-4963</p>
                              </div>

                              <div className="border rounded-lg p-4 space-y-4">
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                  <Stethoscope className="h-4 w-4" />
                                  <span>{"Doctor's Information"}</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Please provide your prescribing doctor{"'"}s name and phone number so we can contact them if needed.
                                </p>
                                <div className="grid sm:grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="doctorName">{"Doctor's Name"}</Label>
                                    <Input
                                      id="doctorName"
                                      placeholder="e.g. Dr. John Smith"
                                      value={doctorName}
                                      onChange={(e) => setDoctorName(e.target.value)}
                                      required
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="doctorPhone">{"Doctor's Phone Number"}</Label>
                                    <Input
                                      id="doctorPhone"
                                      type="tel"
                                      placeholder="(248) 555-0100"
                                      value={doctorPhone}
                                      onChange={(e) => setDoctorPhone(e.target.value)}
                                      required
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </RadioGroup>

                    <div className="flex gap-3">
                      <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                        Back
                      </Button>
                      <Button
                        onClick={() => setStep(3)}
                        className="flex-1"
                        disabled={
                          (prescriptionMethod === "upload" && !prescriptionFile) ||
                          (prescriptionMethod === "eprescribe" && (!doctorName.trim() || !doctorPhone.trim()))
                        }
                      >
                        Continue to Delivery
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {step === 3 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Delivery Method</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <RadioGroup value={deliveryMethod} onValueChange={setDeliveryMethod}>
                      <div className="flex items-start space-x-3 border rounded-lg p-4">
                        <RadioGroupItem value="pickup" id="pickup" className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="pickup" className="font-semibold cursor-pointer">
                              Pickup (Free)
                            </Label>
                            <span className="text-green-600 font-semibold">$0.00</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">Ready in 24-48 hours at our pharmacy</p>
                          {deliveryMethod === "pickup" && (
                            <div className="mt-4 bg-muted/50 rounded-lg p-4 text-sm">
                              <p className="font-semibold mb-2">Pickup Location:</p>
                              <p>40890 Grand River Ave</p>
                              <p>Novi, MI 48375</p>
                              <p className="mt-2 text-muted-foreground">Hours: Mon-Fri 9am-7pm, Sat 9am-5pm</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 border rounded-lg p-4">
                        <RadioGroupItem value="delivery" id="delivery" className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="delivery" className="font-semibold cursor-pointer">
                              Delivery
                            </Label>
                            <span className="font-semibold">$5.00</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">Delivered in 3-5 business days</p>
                        </div>
                      </div>
                    </RadioGroup>

                    <div className="flex gap-3">
                      <Button onClick={() => setStep(2)} variant="outline" className="flex-1">
                        Back
                      </Button>
                      <Button onClick={() => setStep(4)} className="flex-1">
                        Review Order
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {step === 4 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{"Review & Confirm"}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-2">Patient Information</h4>
                      <p className="text-sm">
                        {formData.firstName} {formData.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formData.email} {" - "} {formData.phone}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formData.address}, {formData.city}, {formData.state} {formData.zip}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Prescription</h4>
                      {prescriptionMethod === "upload" ? (
                        <p className="text-sm">
                          {prescriptionFile
                            ? `Uploaded: ${prescriptionFile.name}`
                            : "Upload provided"}
                        </p>
                      ) : (
                        <div className="text-sm space-y-1">
                          <p>Doctor will e-prescribe</p>
                          <p className="text-muted-foreground">
                            {"Doctor: "}{doctorName}
                          </p>
                          <p className="text-muted-foreground">
                            {"Doctor's Phone: "}{doctorPhone}
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Delivery</h4>
                      <p className="text-sm capitalize">
                        {deliveryMethod} {deliveryMethod === "pickup" && "(Free)"}
                      </p>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
                      <p className="font-semibold">Payment Method:</p>
                      <p>Pay in-store (pickup) or Pay on delivery (COD)</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        We accept cash, credit, and debit cards at time of pickup or delivery
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button onClick={() => setStep(3)} variant="outline" className="flex-1">
                        Back
                      </Button>
                      <Button onClick={handleSubmit} className="flex-1" disabled={loading}>
                        {loading ? "Placing Order..." : "Place Order"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order summary - sticky */}
            <div>
              <Card className="p-6 sticky top-20">
                <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
                <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="text-sm">
                      <p className="font-medium">{item.medication?.name || "Unknown"}</p>
                      <p className="text-muted-foreground">
                        {item.quantity} {item.medication?.form?.toLowerCase() || "units"} - ${(item.price || 0).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Delivery:</span>
                    <span className="font-medium">{deliveryFee === 0 ? "Free" : `$${deliveryFee.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
