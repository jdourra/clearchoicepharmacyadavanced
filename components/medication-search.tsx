"use client"

import { useState, useMemo } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type Medication = {
  id: string
  name: string
  generic_name: string | null
  brand_name: string | null
  strength: string | null
  form: string | null
  description: string | null
  is_generic: boolean
}

export function MedicationSearch({ initialMedications }: { initialMedications: Medication[] }) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredMedications = useMemo(() => {
    if (!searchTerm) return initialMedications

    const term = searchTerm.toLowerCase()
    return initialMedications.filter(
      (med) =>
        med.name.toLowerCase().includes(term) ||
        med.generic_name?.toLowerCase().includes(term) ||
        med.brand_name?.toLowerCase().includes(term),
    )
  }, [searchTerm, initialMedications])

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by medication name..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {filteredMedications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No medications found matching your search.</p>
            </CardContent>
          </Card>
        ) : (
          filteredMedications.map((medication) => (
            <Card key={medication.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{medication.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {medication.generic_name && <span>Generic: {medication.generic_name}</span>}
                      {medication.brand_name && medication.generic_name && " • "}
                      {medication.brand_name && <span>Brand: {medication.brand_name}</span>}
                    </CardDescription>
                  </div>
                  {medication.is_generic && <Badge variant="secondary">Generic</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex gap-4 text-sm">
                    {medication.strength && (
                      <div>
                        <span className="font-medium">Strength:</span>{" "}
                        <span className="text-muted-foreground">{medication.strength}</span>
                      </div>
                    )}
                    {medication.form && (
                      <div>
                        <span className="font-medium">Form:</span>{" "}
                        <span className="text-muted-foreground capitalize">{medication.form}</span>
                      </div>
                    )}
                  </div>

                  {medication.description && <p className="text-sm text-muted-foreground">{medication.description}</p>}

                  <Button asChild>
                    <Link href={`/medications/${medication.id}`}>View Pricing</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
