"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AdminHeader } from "@/components/admin-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Search, Loader2 } from "lucide-react"
import { formatCashPrice, type AdminMedication } from "@/lib/admin-medications"
import { staffAuthFetch } from "@/lib/staff-session"

export default function AdminMedicationsPage() {
  const router = useRouter()
  const [medications, setMedications] = useState<AdminMedication[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState("true")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const loadMedications = useCallback(async () => {
    setLoading(true)
    try {
      const meRes = await staffAuthFetch("/api/admin/me")
      if (!meRes.ok) {
        router.push("/admin/login")
        return
      }

      const params = new URLSearchParams({
        page: String(page),
        limit: "50",
        active: activeFilter,
      })
      if (search.trim()) params.set("q", search.trim())

      const res = await staffAuthFetch(`/api/admin/medications?${params}`)
      if (!res.ok) {
        router.push("/admin/login")
        return
      }
      const data = await res.json()
      setMedications(data.medications || [])
      setTotalPages(data.pagination?.totalPages || 1)
      setTotal(data.pagination?.total || 0)
    } catch {
      router.push("/admin/login")
    } finally {
      setLoading(false)
    }
  }, [activeFilter, page, router, search])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadMedications()
    }, 300)
    return () => clearTimeout(timer)
  }, [loadMedications])

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <AdminHeader />
      <main className="flex-1 py-8">
        <div className="container">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Medication Catalog</h1>
              <p className="text-muted-foreground mt-1">
                Add, update, or deactivate drugs in the patient-facing catalog
              </p>
            </div>
            <Button asChild>
              <Link href="/admin/medications/new">
                <Plus className="h-4 w-4 mr-2" />
                Add medication
              </Link>
            </Button>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, generic, or NDC..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setPage(1)
                    }}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={activeFilter}
                  onValueChange={(v) => {
                    setActiveFilter(v)
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active only</SelectItem>
                    <SelectItem value="false">Inactive only</SelectItem>
                    <SelectItem value="all">All medications</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">{total} medication(s)</p>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Strength / Form</TableHead>
                        <TableHead>NDC</TableHead>
                        <TableHead>Per unit</TableHead>
                        <TableHead>30-day</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {medications.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                            No medications found
                          </TableCell>
                        </TableRow>
                      ) : (
                        medications.map((med) => {
                          const perUnit =
                            med.per_unit_cost != null
                              ? Number(med.per_unit_cost)
                              : med.acquisition_cost != null
                                ? Number(med.acquisition_cost) / (Number(med.package_quantity) || 1)
                                : null
                          return (
                            <TableRow key={med.id}>
                              <TableCell>
                                <div className="font-medium">{med.name}</div>
                                {med.generic_name && (
                                  <div className="text-xs text-muted-foreground">{med.generic_name}</div>
                                )}
                              </TableCell>
                              <TableCell className="text-sm">
                                {[med.strength, med.dosage_form].filter(Boolean).join(" · ") || "—"}
                              </TableCell>
                              <TableCell className="font-mono text-xs">{med.ndc || "—"}</TableCell>
                              <TableCell>
                                {perUnit != null ? `$${perUnit.toFixed(4)}` : "—"}
                              </TableCell>
                              <TableCell>{formatCashPrice(perUnit, 30)}</TableCell>
                              <TableCell>
                                <Badge variant={med.is_active !== false ? "default" : "secondary"}>
                                  {med.is_active !== false ? "Active" : "Inactive"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button asChild variant="outline" size="sm">
                                  <Link href={`/admin/medications/${med.id}`}>Edit</Link>
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-3 text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
