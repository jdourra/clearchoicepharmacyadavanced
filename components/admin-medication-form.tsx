"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import {
  DOSAGE_FORMS,
  derivePricingFields,
  formatCashPrice,
  type AdminMedication,
  type AdminMedicationInput,
} from "@/lib/admin-medications"
import { staffAuthFetch } from "@/lib/staff-session"

type AdminMedicationFormProps = {
  mode: "create" | "edit"
  initial?: AdminMedication
}

function toFormState(med?: AdminMedication): AdminMedicationInput {
  return {
    name: med?.name ?? "",
    generic_name: med?.generic_name ?? "",
    brand_name: med?.brand_name ?? "",
    strength: med?.strength ?? "",
    dosage_form: med?.dosage_form ?? "TABLET",
    ndc: med?.ndc ?? "",
    per_unit_cost: med?.per_unit_cost != null ? Number(med.per_unit_cost) : null,
    acquisition_cost: med?.acquisition_cost != null ? Number(med.acquisition_cost) : null,
    our_price: med?.our_price != null ? Number(med.our_price) : null,
    typical_retail_price: med?.typical_retail_price != null ? Number(med.typical_retail_price) : null,
    package_quantity: med?.package_quantity != null ? Number(med.package_quantity) : 1,
    is_generic: med?.is_generic !== false,
    is_active: med?.is_active !== false,
    category: med?.category ?? "",
    description: med?.description ?? "",
    days_supply: med?.days_supply != null ? Number(med.days_supply) : 30,
  }
}

export function AdminMedicationForm({ mode, initial }: AdminMedicationFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<AdminMedicationInput>(() => toFormState(initial))
  const [saving, setSaving] = useState(false)
  const [deactivating, setDeactivating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pricing = useMemo(() => derivePricingFields(form), [form])

  const update = <K extends keyof AdminMedicationInput>(key: K, value: AdminMedicationInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload: AdminMedicationInput = {
      ...form,
      name: form.name.trim(),
      generic_name: form.generic_name?.toString().trim() || null,
      brand_name: form.brand_name?.toString().trim() || null,
      strength: form.strength?.toString().trim() || null,
      ndc: form.ndc?.toString().trim() || null,
      category: form.category?.toString().trim() || null,
      description: form.description?.toString().trim() || null,
      per_unit_cost: form.per_unit_cost != null ? Number(form.per_unit_cost) : null,
      acquisition_cost: form.acquisition_cost != null ? Number(form.acquisition_cost) : null,
      our_price: form.our_price != null ? Number(form.our_price) : null,
      typical_retail_price:
        form.typical_retail_price != null ? Number(form.typical_retail_price) : null,
      package_quantity: Number(form.package_quantity) || 1,
      days_supply: Number(form.days_supply) || 30,
    }

    try {
      const url = mode === "create" ? "/api/admin/medications" : `/api/admin/medications/${initial!.id}`
      const method = mode === "create" ? "POST" : "PATCH"
      const res = await staffAuthFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to save medication")
      }
      router.push("/admin/medications")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save medication")
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async () => {
    if (!initial?.id) return
    if (!confirm("Deactivate this medication? It will be hidden from patient search but order history is preserved.")) {
      return
    }
    setDeactivating(true)
    setError(null)
    try {
      const res = await staffAuthFetch(`/api/admin/medications/${initial.id}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to deactivate")
      router.push("/admin/medications")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to deactivate medication")
    } finally {
      setDeactivating(false)
    }
  }

  const handleReactivate = async () => {
    if (!initial?.id) return
    setSaving(true)
    setError(null)
    try {
      const res = await staffAuthFetch(`/api/admin/medications/${initial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, is_active: true }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to reactivate")
      update("is_active", true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reactivate medication")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Drug information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. Metformin"
              required
            />
          </div>
          <div>
            <Label htmlFor="generic_name">Generic name</Label>
            <Input
              id="generic_name"
              value={form.generic_name ?? ""}
              onChange={(e) => update("generic_name", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="brand_name">Brand name</Label>
            <Input
              id="brand_name"
              value={form.brand_name ?? ""}
              onChange={(e) => update("brand_name", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="strength">Strength</Label>
            <Input
              id="strength"
              value={form.strength ?? ""}
              onChange={(e) => update("strength", e.target.value)}
              placeholder="e.g. 500mg"
            />
          </div>
          <div>
            <Label htmlFor="dosage_form">Dosage form</Label>
            <Select value={form.dosage_form || "TABLET"} onValueChange={(v) => update("dosage_form", v)}>
              <SelectTrigger id="dosage_form">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOSAGE_FORMS.map((formOption) => (
                  <SelectItem key={formOption} value={formOption}>
                    {formOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="ndc">NDC</Label>
            <Input
              id="ndc"
              value={form.ndc ?? ""}
              onChange={(e) => update("ndc", e.target.value)}
              placeholder="10 or 11 digits"
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={form.category ?? ""}
              onChange={(e) => update("category", e.target.value)}
              placeholder="e.g. diabetes"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description ?? ""}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <Checkbox
              id="is_generic"
              checked={form.is_generic !== false}
              onCheckedChange={(checked) => update("is_generic", checked === true)}
            />
            <Label htmlFor="is_generic" className="font-normal cursor-pointer">
              Generic drug
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="per_unit_cost">Per-unit cost ($) *</Label>
            <Input
              id="per_unit_cost"
              type="number"
              step="0.0001"
              min="0"
              value={form.per_unit_cost ?? ""}
              onChange={(e) =>
                update("per_unit_cost", e.target.value === "" ? null : Number(e.target.value))
              }
              placeholder="e.g. 0.05"
            />
          </div>
          <div>
            <Label htmlFor="acquisition_cost">Package acquisition cost ($)</Label>
            <Input
              id="acquisition_cost"
              type="number"
              step="0.01"
              min="0"
              value={form.acquisition_cost ?? ""}
              onChange={(e) =>
                update("acquisition_cost", e.target.value === "" ? null : Number(e.target.value))
              }
            />
          </div>
          <div>
            <Label htmlFor="package_quantity">Package quantity</Label>
            <Input
              id="package_quantity"
              type="number"
              min="1"
              value={form.package_quantity ?? 1}
              onChange={(e) => update("package_quantity", Number(e.target.value) || 1)}
            />
          </div>
          <div>
            <Label htmlFor="days_supply">Days supply (for price calc)</Label>
            <Input
              id="days_supply"
              type="number"
              min="1"
              value={form.days_supply ?? 30}
              onChange={(e) => update("days_supply", Number(e.target.value) || 30)}
            />
          </div>
          <div>
            <Label htmlFor="our_price">Our price (auto if blank)</Label>
            <Input
              id="our_price"
              type="number"
              step="0.01"
              min="0"
              value={form.our_price ?? ""}
              onChange={(e) => update("our_price", e.target.value === "" ? null : Number(e.target.value))}
              placeholder={pricing.ourPrice != null ? String(pricing.ourPrice) : ""}
            />
          </div>
          <div>
            <Label htmlFor="typical_retail_price">Typical retail (auto if blank)</Label>
            <Input
              id="typical_retail_price"
              type="number"
              step="0.01"
              min="0"
              value={form.typical_retail_price ?? ""}
              onChange={(e) =>
                update("typical_retail_price", e.target.value === "" ? null : Number(e.target.value))
              }
              placeholder={pricing.typicalRetail != null ? String(pricing.typicalRetail) : ""}
            />
          </div>
          <div className="sm:col-span-2 rounded-lg border bg-muted/40 p-4 text-sm">
            <p className="font-medium mb-2">Cash-pay preview (Drug Cost + 15% + $5)</p>
            <div className="flex flex-wrap gap-4 text-muted-foreground">
              <span>30-day: {formatCashPrice(pricing.perUnit, 30)}</span>
              <span>90-day: {formatCashPrice(pricing.perUnit, 90)}</span>
              {pricing.perUnit != null && (
                <span>Per unit: ${pricing.perUnit.toFixed(4)}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={saving || deactivating}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "create" ? "Add medication" : "Save changes"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/medications">Cancel</Link>
        </Button>
        {mode === "edit" && form.is_active !== false && (
          <Button type="button" variant="destructive" onClick={handleDeactivate} disabled={deactivating || saving}>
            {deactivating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Deactivate
          </Button>
        )}
        {mode === "edit" && form.is_active === false && (
          <Button type="button" variant="secondary" onClick={handleReactivate} disabled={saving}>
            Reactivate
          </Button>
        )}
      </div>
    </form>
  )
}
