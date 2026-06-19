export type EdFormulationAddOn = "oxytocin" | "apomorphine" | "pe"

export const ED_FORMULATION_ADD_ONS: {
  id: EdFormulationAddOn
  label: string
  description: string
}[] = [
  {
    id: "oxytocin",
    label: "Oxytocin",
    description: "Optional add-on for intimacy and emotional connection support.",
  },
  {
    id: "apomorphine",
    label: "Apomorphine",
    description: "Optional add-on for low libido and arousal support.",
  },
  {
    id: "pe",
    label: "PE Support",
    description: "Optional premature ejaculation adjunct blended into your troche.",
  },
]

const ADD_ON_SET = new Set<string>(ED_FORMULATION_ADD_ONS.map((a) => a.id))

export function parseEdAddOns(param: string | null | undefined): EdFormulationAddOn[] {
  if (!param?.trim()) return []
  return param
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is EdFormulationAddOn => ADD_ON_SET.has(s))
}

export function formatEdAddOns(addOns: EdFormulationAddOn[]): string {
  if (addOns.length === 0) return "None"
  return addOns
    .map((id) => ED_FORMULATION_ADD_ONS.find((a) => a.id === id)?.label ?? id)
    .join(", ")
}
