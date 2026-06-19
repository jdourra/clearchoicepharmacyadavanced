"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import {
  INJECTION_CONSENT_URLS,
  requiresSelfInjectionConsent,
  showTirzepatideAddendum,
  type InjectionConsentVariant,
  type InjectionTelehealthConsentValues,
} from "@/lib/injection-telehealth-consents"

type InjectionTelehealthConsentsProps = {
  values: InjectionTelehealthConsentValues
  onChange: <K extends keyof InjectionTelehealthConsentValues>(
    key: K,
    value: InjectionTelehealthConsentValues[K]
  ) => void
  variant: InjectionConsentVariant
  programId?: string
  invalidFields?: Set<string>
  idPrefix?: string
}

function isInvalid(invalidFields: Set<string> | undefined, field: string) {
  return invalidFields?.has(field) ?? false
}

function ConsentRow({
  id,
  field,
  checked,
  onCheckedChange,
  invalidFields,
  children,
}: {
  id: string
  field: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  invalidFields?: Set<string>
  children: React.ReactNode
}) {
  return (
    <div
      data-field={field}
      className={cn(
        "rounded-lg border p-4 space-y-3",
        isInvalid(invalidFields, field) && "border-destructive ring-2 ring-destructive bg-destructive/5"
      )}
    >
      <div className="text-sm text-muted-foreground leading-relaxed">{children}</div>
      <label htmlFor={id} className="flex items-center gap-2 text-sm font-medium cursor-pointer">
        <Checkbox id={id} checked={checked} onCheckedChange={(c) => onCheckedChange(c === true)} />
        I Agree
      </label>
    </div>
  )
}

export function InjectionTelehealthConsents({
  values,
  onChange,
  variant,
  programId,
  invalidFields,
  idPrefix = "injection-consent",
}: InjectionTelehealthConsentsProps) {
  const selfInject = requiresSelfInjectionConsent(variant, programId)
  const tirzepatide = showTirzepatideAddendum(programId)

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-lg">Telemedicine Consents &amp; Acknowledgments</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Required before your intake is submitted for provider review.
        </p>
      </div>

      {selfInject && (
        <>
          <ConsentRow
            id={`${idPrefix}-video`}
            field="watchedInjectionVideo"
            checked={values.watchedInjectionVideo}
            onCheckedChange={(c) => onChange("watchedInjectionVideo", c)}
            invalidFields={invalidFields}
          >
            <p className="font-semibold text-foreground">REQUIRED &quot;HOW TO&quot; VIDEO *</p>
            <p>
              I have watched the video and know how to give myself an injection. The instructional video is available at{" "}
              <a
                href={INJECTION_CONSENT_URLS.howToInject}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                {INJECTION_CONSENT_URLS.howToInject}
              </a>
              .
            </p>
          </ConsentRow>

          <ConsentRow
            id={`${idPrefix}-bottle`}
            field="followBottleInstructions"
            checked={values.followBottleInstructions}
            onCheckedChange={(c) => onChange("followBottleInstructions", c)}
            invalidFields={invalidFields}
          >
            <p>
              I WILL FOLLOW THE INSTRUCTIONS AND DOSAGE AMOUNTS ON MY BOTTLE. I understand these injections are to be
              self-injected in the area written on my bottle. I will watch the video to learn how to self-inject. I am
              aware the instructional video is available at{" "}
              <a
                href={INJECTION_CONSENT_URLS.howToInject}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                {INJECTION_CONSENT_URLS.howToInject}
              </a>
              . I agree I will use the syringes and medication as directed.
            </p>
          </ConsentRow>
        </>
      )}

      <ConsentRow
        id={`${idPrefix}-expiration`}
        field="understand28DayExpiration"
        checked={values.understand28DayExpiration}
        onCheckedChange={(c) => onChange("understand28DayExpiration", c)}
        invalidFields={invalidFields}
      >
        <p>
          I understand that my custom package is ordered for me. My vial or package will have an expiration date that is{" "}
          <strong>28 days after opening</strong>. I understand that after the 28-day period, medications are considered
          expired and should be discarded by me.
        </p>
      </ConsentRow>

      <ConsentRow
        id={`${idPrefix}-503a`}
        field="compounding503ADisclosure"
        checked={values.compounding503ADisclosure}
        onCheckedChange={(c) => onChange("compounding503ADisclosure", c)}
        invalidFields={invalidFields}
      >
        <p>
          I understand that my medication is prepared in a compounding pharmacy in accordance with Section 503A of the
          Federal Food, Drug, and Cosmetic Act and is dispensed solely pursuant to a valid patient-specific prescription
          from a licensed healthcare provider.
        </p>
        {tirzepatide && (
          <p className="mt-3">
            If I am ordering Tirzepatide, I understand the following: This compounded medication contains Tirzepatide
            combined with glycine and vitamin B12, and is formulated specifically for individual patients who may not
            tolerate standard formulations or who require a customized therapeutic approach. It is prepared in accordance
            with Section 503A of the Federal Food, Drug, and Cosmetic Act and is dispensed solely pursuant to a valid
            patient-specific prescription from a licensed healthcare provider. Our compounded formulation is not
            affiliated with, endorsed by, or intended to replace the FDA-approved product manufactured by Eli Lilly.
            The addition of glycine and vitamin B12 is intended to support patients experiencing issues such as fatigue,
            muscle loss, or neuropathy—common concerns during weight loss or diabetes treatment—and may offer metabolic,
            neurological, and musculoskeletal benefits. This medication is not made for resale, bulk distribution, or
            office use, and is compounded exclusively to meet the clinical needs of individual patients when commercially
            available alternatives are not appropriate.
          </p>
        )}
      </ConsentRow>

      {selfInject && (
        <ConsentRow
          id={`${idPrefix}-home-injection`}
          field="homeInjectionConsent"
          checked={values.homeInjectionConsent}
          onCheckedChange={(c) => onChange("homeInjectionConsent", c)}
          invalidFields={invalidFields}
        >
          <p className="font-semibold text-foreground">CONSENT FORM</p>
          <p>
            I acknowledge that I have received instructions and educational material from Clear Choice Pharmacy for the
            administration of home injections. I acknowledge that the risks of injections have been discussed with me. I
            understand that these risks include, but are not limited to, local reactions, rashes, bruises, etc.
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>
              If I elect to do self-administered injections or if another designated individual gives me the injection, I
              should be attended for at least 30 minutes by a responsible adult to assist me in case of a severe reaction.
            </li>
            <li>
              I agree to have on hand an epinephrine injector to use in case of a systemic reaction. I acknowledge that I
              have received instruction on its use and administration. I further understand that I must verify that the
              date of this medication is current. If not, I will call for a renewal of my medication.
            </li>
            <li>
              I understand that it is my responsibility to maintain follow-up appointments with my physician as needed.
            </li>
          </ul>
          <p className="mt-2">
            By signing this form, I assume full responsibility for receiving my injections and release Clear Choice
            Pharmacy and its physicians from any liability or responsibility for any reactions, conditions,
            self-injection procedures or injuries in conjunction with the injection therapies. I also understand that I am
            able to use Clear Choice Pharmacy services and go to any pharmacy of my choosing.
          </p>
        </ConsentRow>
      )}

      <ConsentRow
        id={`${idPrefix}-refund`}
        field="noReturnsRefundPolicy"
        checked={values.noReturnsRefundPolicy}
        onCheckedChange={(c) => onChange("noReturnsRefundPolicy", c)}
        invalidFields={invalidFields}
      >
        <p className="font-semibold text-foreground">NO RETURNS</p>
        <p>
          I UNDERSTAND THIS IS A NON-REFUNDABLE PRODUCT AND CANNOT BE RETURNED. I AGREE TO THE REFUND POLICY AVAILABLE AT{" "}
          <a
            href={INJECTION_CONSENT_URLS.refundPolicy}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            {INJECTION_CONSENT_URLS.refundPolicy}
          </a>
          . I authorize Clear Choice Pharmacy to charge my credit card for agreed upon purchases. I understand that my
          information will be saved to file for future transactions on my account.
        </p>
      </ConsentRow>

      <ConsentRow
        id={`${idPrefix}-telehealth`}
        field="telehealthConsent"
        checked={values.telehealthConsent}
        onCheckedChange={(c) => onChange("telehealthConsent", c)}
        invalidFields={invalidFields}
      >
        <p>
          I agree to give my consent to treat. I have read the Telehealth Consent located at{" "}
          <a
            href={INJECTION_CONSENT_URLS.telehealthConsent}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            {INJECTION_CONSENT_URLS.telehealthConsent}
          </a>
          .
        </p>
      </ConsentRow>

      <ConsentRow
        id={`${idPrefix}-terms`}
        field="termsAndConditions"
        checked={values.termsAndConditions}
        onCheckedChange={(c) => onChange("termsAndConditions", c)}
        invalidFields={invalidFields}
      >
        <p>
          I agree to Clear Choice Pharmacy&apos;s Terms and Conditions. I have read the Terms and Conditions located at{" "}
          <a href={INJECTION_CONSENT_URLS.terms} target="_blank" rel="noopener noreferrer" className="text-primary underline">
            {INJECTION_CONSENT_URLS.terms}
          </a>
          .
        </p>
      </ConsentRow>

      <ConsentRow
        id={`${idPrefix}-privacy`}
        field="agreeToPrivacy"
        checked={values.agreeToPrivacy}
        onCheckedChange={(c) => onChange("agreeToPrivacy", c)}
        invalidFields={invalidFields}
      >
        <p>
          I understand my health information will be handled in accordance with HIPAA regulations. I have read the
          Privacy Policy located at{" "}
          <a
            href={INJECTION_CONSENT_URLS.privacy}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            {INJECTION_CONSENT_URLS.privacy}
          </a>
          .
        </p>
      </ConsentRow>

      <div
        data-field="eSignName"
        className={cn(
          "rounded-lg border p-4 space-y-2",
          isInvalid(invalidFields, "eSignName") && "border-destructive ring-2 ring-destructive bg-destructive/5"
        )}
      >
        <Label htmlFor={`${idPrefix}-esign`} className={cn(isInvalid(invalidFields, "eSignName") && "text-destructive")}>
          PRINT NAME — I HAVE READ THE ABOVE CONSENT FORM AND AGREE TO E-SIGN (First and Last Name) *
        </Label>
        <Input
          id={`${idPrefix}-esign`}
          value={values.eSignName}
          onChange={(e) => onChange("eSignName", e.target.value)}
          placeholder="First and Last Name"
          className={cn(isInvalid(invalidFields, "eSignName") && "border-destructive ring-2 ring-destructive")}
        />
      </div>
    </div>
  )
}
