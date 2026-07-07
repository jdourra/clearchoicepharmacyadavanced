import type { EdBillingPlan } from "@/lib/ed-troche-catalog"
import type { EdFormulationAddOn } from "@/lib/ed-add-ons"

export function buildEdProductUrl(productId: string): string {
  return `/mens-health/ed/${productId}`
}

export function buildEdIntakeUrl(
  productId: string,
  options?: { addOns?: EdFormulationAddOn[]; plan?: EdBillingPlan }
): string {
  const params = new URLSearchParams({ product: productId })
  if (options?.plan) params.set("plan", options.plan)
  if (options?.addOns && options.addOns.length > 0) {
    params.set("addons", options.addOns.join(","))
  }
  return `/mens-health/start?${params.toString()}`
}

export function buildTrtProductUrl(programId: string): string {
  return `/mens-health/trt/${programId}`
}

export function buildTrtIntakeUrl(programId: string, plan: string = "quarterly"): string {
  const params = new URLSearchParams({ program: programId, plan })
  return `/mens-health/trt/start?${params.toString()}`
}

export function buildWeightLossProductUrl(programId: string): string {
  return `/weight-loss/${programId}`
}

export function buildWeightLossIntakeUrl(programId: string, plan: string = "monthly"): string {
  const params = new URLSearchParams({ program: programId, plan })
  return `/weight-loss/start?${params.toString()}`
}

export function buildIvPackageProductUrl(packageId: string): string {
  return `/iv-rejuvenation/packages/${packageId}`
}

export function buildVialProductUrl(vialId: string): string {
  return `/iv-rejuvenation/vials/${encodeURIComponent(vialId)}`
}

export function buildVialIntakeUrl(vialId: string): string {
  return `/iv-rejuvenation/vials/start?vial=${encodeURIComponent(vialId)}`
}

export function buildIvBookUrl(packageId: string, boosters: string[] = []): string {
  const params = new URLSearchParams({ package: packageId })
  if (boosters.length > 0) params.set("boosters", boosters.join(","))
  return `/iv-rejuvenation/book?${params.toString()}`
}
