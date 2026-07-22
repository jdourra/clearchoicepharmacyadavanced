"use client"

import { useEffect, useState } from "react"
import { authFetch } from "@/lib/session"
import { formatPhoneDisplay } from "@/lib/phone"

export type PatientProfileFromApi = {
  id: string
  email: string
  name?: string
  firstName: string
  lastName: string
  phone: string
  dob: string
  address: string
  city: string
  state: string
  zip: string
}

const US_STATE_CODE_TO_NAME: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
}

const US_STATE_NAME_TO_CODE = Object.fromEntries(
  Object.entries(US_STATE_CODE_TO_NAME).map(([code, name]) => [name, code])
) as Record<string, string>

export function stateToFullName(raw: string): string {
  const value = raw.trim()
  if (!value) return ""
  if (value.length === 2) return US_STATE_CODE_TO_NAME[value.toUpperCase()] || value
  return value
}

export function stateToCode(raw: string): string {
  const value = raw.trim()
  if (!value) return ""
  if (value.length === 2) return value.toUpperCase()
  return US_STATE_NAME_TO_CODE[value] || value
}

export function formatDobForInput(dob: string): string {
  if (!dob) return ""
  return dob.split("T")[0]
}

export function pickProfile<T extends string>(current: T, fromProfile: string): T {
  return (current.trim() ? current : fromProfile) as T
}

export async function fetchPatientProfile(): Promise<PatientProfileFromApi | null> {
  try {
    const res = await authFetch("/api/auth/me")
    const data = await res.json()
    if (!data.user) return null
    const u = data.user
    return {
      id: String(u.id),
      email: String(u.email || ""),
      name: u.name ? String(u.name) : undefined,
      firstName: String(u.firstName || u.name?.split(" ")[0] || ""),
      lastName: String(u.lastName || u.name?.split(" ").slice(1).join(" ") || ""),
      phone: formatPhoneDisplay(String(u.phone || "")),
      dob: formatDobForInput(String(u.dob || "")),
      address: String(u.address || ""),
      city: String(u.city || ""),
      state: String(u.state || ""),
      zip: String(u.zip || ""),
    }
  } catch {
    return null
  }
}

export function usePatientProfilePrefill(): {
  profile: PatientProfileFromApi | null
  isLoggedIn: boolean
  loaded: boolean
} {
  const [profile, setProfile] = useState<PatientProfileFromApi | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchPatientProfile()
      .then((user) => {
        if (!cancelled) setProfile(user)
      })
      .finally(() => {
        if (!cancelled) setLoaded(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { profile, isLoggedIn: Boolean(profile), loaded }
}

/** Common demographic + shipping fields used across clinical intakes. */
export function applyResidentialProfile<
  T extends {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    dateOfBirth?: string
    state?: string
    address?: string
    city?: string
    zipCode?: string
    shippingAddress?: string
    shippingCity?: string
    shippingState?: string
    shippingZip?: string
    sameAsResidential?: boolean
  },
>(current: T, profile: PatientProfileFromApi): T {
  const firstName = pickProfile(current.firstName || "", profile.firstName)
  const lastName = pickProfile(current.lastName || "", profile.lastName)
  const email = pickProfile(current.email || "", profile.email)
  const phone = pickProfile(current.phone || "", profile.phone)
  const dateOfBirth = pickProfile(current.dateOfBirth || "", profile.dob)
  const address = pickProfile(current.address || "", profile.address)
  const city = pickProfile(current.city || "", profile.city)
  const zipCode = pickProfile(current.zipCode || "", profile.zip)
  const state = pickProfile(current.state || "", stateToFullName(profile.state))

  const useSameShipping = current.sameAsResidential !== false
  const shippingAddress = pickProfile(
    current.shippingAddress || "",
    useSameShipping ? profile.address : ""
  )
  const shippingCity = pickProfile(current.shippingCity || "", useSameShipping ? profile.city : "")
  const shippingZip = pickProfile(current.shippingZip || "", useSameShipping ? profile.zip : "")
  const shippingState = pickProfile(
    current.shippingState || "",
    useSameShipping ? stateToFullName(profile.state) : ""
  )

  return {
    ...current,
    firstName,
    lastName,
    email,
    phone,
    dateOfBirth,
    address,
    city,
    zipCode,
    state,
    shippingAddress,
    shippingCity,
    shippingZip,
    shippingState,
  }
}
