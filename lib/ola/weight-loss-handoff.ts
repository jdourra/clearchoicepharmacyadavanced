import "server-only"
import { fetchIdDocument } from "@/lib/intake-id-storage"
import { createOlaConsult, createOlaPatient, OlaApiError, uploadOlaConsultFiles } from "@/lib/ola/client"
import { getOlaConfig, isOlaHandoffEnabled, weightLossOlaService } from "@/lib/ola/config"
import { toUsE164 } from "@/lib/phone"
import { parseUsState, requiresSyncVisit } from "@/lib/us-states"

export type WeightLossOlaHandoffInput = {
  submissionId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: "male" | "female" | "other"
  address: string
  city: string
  state: string
  zipCode: string
  program: string
  billingPlan: string
  doseLabel: string
  allergies: string
  paymentOnFile: boolean
  questions: { question: string; answer: string }[]
  schedule: { scheduleStart: string; scheduleEnd: string; providerGuid: string } | null
  idFrontKey: string | null
  idBackKey: string | null
  medicationPhotoKeys?: string[]
  existingPatientGuid?: string | null
  paymentNote?: string
}

export type WeightLossOlaHandoffResult = {
  partnerName: "Clinician network"
  partnerStatus: string
  partnerCaseId: string | null
  patientGuid: string | null
  detail: string
}

function queued(detail: string, status = "ready_for_clinician_network"): WeightLossOlaHandoffResult {
  return {
    partnerName: "Clinician network",
    partnerStatus: status,
    partnerCaseId: null,
    patientGuid: null,
    detail,
  }
}

function allergyList(value: string): string[] {
  const text = value.trim()
  if (!text || /^none\b/i.test(text)) return []
  return text
    .split(/[,;\n]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 20)
}

export async function handoffWeightLossToOla(
  input: WeightLossOlaHandoffInput,
  options?: { staffConfirmedPayment?: boolean }
): Promise<WeightLossOlaHandoffResult> {
  if (!options?.staffConfirmedPayment && !isOlaHandoffEnabled()) {
    return queued("Clinician network handoff is off. The intake is saved for staff.")
  }

  if (!input.paymentOnFile) {
    return queued(
      "Payment has not been received, so this intake was not sent to the clinician network.",
      "waiting_for_payment"
    )
  }

  const config = getOlaConfig()
  if (!config) {
    return queued("Clinician network credentials are missing. The intake is saved for staff.")
  }

  const state = parseUsState(input.state)
  const phone = toUsE164(input.phone)
  if (!state || !phone) {
    return queued(
      "Phone or state could not be sent to the clinician network. The intake is saved for staff.",
      "clinician_network_error"
    )
  }

  let patientGuid = input.existingPatientGuid?.trim() || ""
  if (!patientGuid) try {
    patientGuid = await createOlaPatient({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone,
      dob: input.dateOfBirth,
      gender: input.gender,
      street: input.address,
      city: input.city,
      state: state.code,
      postalCode: input.zipCode,
      allergies: allergyList(input.allergies),
    })
  } catch (error) {
    const message = error instanceof OlaApiError ? error.message : "Clinician network patient create failed"
    return queued(`${message}. The intake is saved for staff.`, "clinician_network_error")
  }

  const service = weightLossOlaService(input.program, input.billingPlan)
  if (!service) {
    return {
      partnerName: "Clinician network",
      partnerStatus: "waiting_for_service_key",
      partnerCaseId: patientGuid,
      patientGuid,
      detail: `Patient ${patientGuid} was created. This program still needs its own service key, so the consult was not sent.`,
    }
  }

  if (!config.pharmacy) {
    return {
      partnerName: "Clinician network",
      partnerStatus: "waiting_for_pharmacy",
      partnerCaseId: patientGuid,
      patientGuid,
      detail: `Patient ${patientGuid} was created. Partner pharmacy name, address, and phone are not set, so the consult was not sent.`,
    }
  }

  const sync = requiresSyncVisit(state.code)
  if (sync && !input.schedule) {
    return {
      partnerName: "Clinician network",
      partnerStatus: "needs_video_visit",
      partnerCaseId: patientGuid,
      patientGuid,
      detail: `Patient ${patientGuid} was created. This state needs a video visit time before the consult can be sent.`,
    }
  }

  let orderGuid: string
  try {
    orderGuid = await createOlaConsult({
      patientGuid,
      questions: [
        ...input.questions.map((item) => ({ question_text: item.question, answer: item.answer })),
        { question_text: "Selected dose", answer: input.doseLabel || "Not selected" },
        {
          question_text: "Payment collected by Clear Choice Pharmacy",
          answer: input.paymentNote || (input.paymentOnFile ? "yes" : "not yet"),
        },
      ],
      serviceKey: service.serviceKey,
      sessionType: "initial",
      scheduleType: service.scheduleType,
      transactionId: input.submissionId,
      pharmacy: config.pharmacy,
      schedule: sync && input.schedule ? input.schedule : undefined,
    })
  } catch (error) {
    const message = error instanceof OlaApiError ? error.message : "Clinician network consult create failed"
    return {
      partnerName: "Clinician network",
      partnerStatus: "clinician_network_error",
      partnerCaseId: patientGuid,
      patientGuid,
      detail: `Patient ${patientGuid} was created. Consult was not created: ${message}`,
    }
  }

  const files: { filename: string; contentType: string; body: Buffer }[] = []
  const uploads: [string | null | undefined, string][] = [
    [input.idFrontKey, "id-front"],
    [input.idBackKey, "id-back"],
    ...(input.medicationPhotoKeys || []).map((key, index) => [key, `medication-${index + 1}`] as [string, string]),
  ]
  for (const [key, filename] of uploads) {
    if (!key) continue
    const loaded = await fetchIdDocument(key)
    if (!loaded.ok) continue
    const extension = loaded.contentType.includes("png")
      ? "png"
      : loaded.contentType.includes("pdf")
        ? "pdf"
        : "jpg"
    files.push({
      filename: `${filename}.${extension}`,
      contentType: loaded.contentType,
      body: loaded.body,
    })
  }

  let detail = `Consult ${orderGuid} created for patient ${patientGuid}.`
  if (files.length > 0) {
    try {
      await uploadOlaConsultFiles(orderGuid, files)
      detail += " Photo ID uploaded."
    } catch (error) {
      const message = error instanceof OlaApiError ? error.message : "ID upload failed"
      detail += ` Photo ID was not uploaded: ${message}`
    }
  } else if (input.idFrontKey || input.idBackKey) {
    detail += " Photo ID is saved here but could not be read for upload."
  }

  return {
    partnerName: "Clinician network",
    partnerStatus: "sent_to_clinician_network",
    partnerCaseId: orderGuid,
    patientGuid,
    detail,
  }
}
