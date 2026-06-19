import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { labelsForFields } from "@/lib/intake-field-labels"

type IntakeValidationAlertProps = {
  message: string
  fields: string[]
}

export function IntakeValidationAlert({ message, fields }: IntakeValidationAlertProps) {
  if (!message) return null

  const labels = labelsForFields(fields)

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Please complete the following</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>{message}</p>
        {labels.length > 0 && (
          <ul className="list-disc pl-5 space-y-0.5 text-sm">
            {labels.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        )}
      </AlertDescription>
    </Alert>
  )
}
