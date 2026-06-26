import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DEFAULT_INTAKE_SUCCESS_STEPS,
  physicianReviewDescription,
  physicianReviewPendingLabel,
  PRIMARY_PHYSICIAN,
} from "@/lib/clinical-provider"

type IntakeSuccessPanelProps = {
  title?: string
  submissionId?: string
  treatmentLabel?: string
  description?: string
  steps?: string[]
  returnHref: string
  returnLabel: string
  children?: React.ReactNode
}

export function IntakeSuccessPanel({
  title = "Intake Submitted Successfully",
  submissionId,
  treatmentLabel,
  description,
  steps = [...DEFAULT_INTAKE_SUCCESS_STEPS],
  returnHref,
  returnLabel,
  children,
}: IntakeSuccessPanelProps) {
  return (
    <Card className="border-green-200">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description ?? physicianReviewDescription()}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {(submissionId || treatmentLabel) && (
          <div className="grid gap-3 sm:grid-cols-2">
            {submissionId && (
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Reference</p>
                <p className="font-mono text-sm">{submissionId}</p>
              </div>
            )}
            {treatmentLabel && (
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Selected treatment</p>
                <p className="font-medium text-sm">{treatmentLabel}</p>
              </div>
            )}
            <div className="rounded-lg border p-3 sm:col-span-2">
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="font-medium text-amber-600">{physicianReviewPendingLabel()}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Reviewing physician: {PRIMARY_PHYSICIAN.name}, {PRIMARY_PHYSICIAN.state}
              </p>
            </div>
          </div>
        )}

        {children}

        <ol className="text-sm space-y-2 text-muted-foreground list-decimal list-inside">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </CardContent>
      <CardFooter className="border-t pt-6">
        <Button className="w-full" asChild>
          <Link href={returnHref}>{returnLabel}</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
