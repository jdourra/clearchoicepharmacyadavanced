/** Patient intake from Elite Care GLP-1 protocol Section 13 and Section 14 (July 16, 2026). */

export const GLP1_EXCLUSIONS = [
  { id: "mtc", label: "Medullary thyroid cancer (MTC) or family history of MTC" },
  { id: "men2", label: "Multiple Endocrine Neoplasia syndrome type 2 (MEN2) or family history of MEN2" },
  { id: "hypersensitivity", label: "Known allergy or hypersensitivity to semaglutide, tirzepatide, or any GLP-1 receptor agonist" },
  { id: "type1", label: "Type 1 diabetes" },
  { id: "type2-uncontrolled", label: "Type 2 diabetes that is not well controlled according to the provider managing your diabetes" },
  { id: "other-diabetes-meds", label: "Currently taking diabetes or blood sugar medication other than metformin (insulin, sulfonylureas, thiazolidinediones, or DPP-4 inhibitors)" },
  { id: "retinopathy", label: "History of diabetic retinopathy" },
  { id: "heart-failure", label: "Heart failure (CHF), treated or untreated" },
  { id: "thyroid-disease", label: "Uncontrolled or untreated thyroid disease" },
  { id: "cirrhosis", label: "Cirrhosis or severe liver disease" },
  { id: "kidney", label: "Kidney disease (kidney failure or reduced kidney function)" },
  { id: "pancreatitis", label: "History of pancreatitis" },
  { id: "gallbladder", label: "History of gallbladder problems and your gallbladder has not been surgically removed" },
  { id: "gi", label: "Gastrointestinal disorders (gastroparesis, bowel obstruction, severe GERD, cyclic vomiting, or severe chronic constipation)" },
  { id: "active-cancer", label: "Cancer that is actively being treated" },
  { id: "eating-disorder", label: "Restrictive or purging eating disorder (anorexia nervosa or bulimia nervosa)" },
  { id: "psychiatric", label: "A severe or uncontrolled mental health condition, including active psychosis, severe untreated depression, or active suicidal ideation" },
  { id: "none", label: "None of the above" },
] as const

export const GLP1_CONCERNS = [
  { id: "brand-side-effects", label: "I have had severe side effects with name-brand tirzepatide or semaglutide in the past" },
  { id: "fatigue", label: "I have or am concerned about fatigue or low energy" },
  { id: "skin", label: "I am concerned about loose or saggy skin related to significant weight loss" },
  { id: "nausea", label: "I am concerned about nausea and other gastrointestinal side effects" },
  { id: "fatty-liver", label: "I have a history of fatty liver disease" },
  { id: "muscle", label: "I am concerned about muscle loss during weight loss" },
  { id: "none", label: "None of these apply to me. A compounded prescription cannot be offered without one of the concerns above." },
] as const

export const GLP1_ALCOHOL = [
  { id: "never", label: "Never / almost never" },
  { id: "le3", label: "3 or fewer drinks per week" },
  { id: "3to5", label: "3–5 drinks per week" },
  { id: "5to7", label: "5–7 drinks per week" },
  { id: "more7", label: "More than 7 drinks per week" },
] as const

export const GLP1_CONTRACEPTION = [
  "Not using any contraception",
  "Oral birth control pills",
  "Injectables or implants",
  "Patches or vaginal ring",
  "Intrauterine device (IUD)",
  "Barrier method (condoms, sponges, diaphragm)",
  "Partner vasectomy",
  "Tubal ligation / sterilization",
  "Not applicable (post-menopausal, hysterectomy, or not sexually active)",
] as const

export const GLP1_DOSE_PREFERENCES = [
  { id: "decrease", label: "Decrease dose" },
  { id: "maintain", label: "Maintain dose" },
  { id: "increase", label: "Increase dose" },
] as const

export const OCP_ACKNOWLEDGMENT =
  "Tirzepatide may reduce the effectiveness of oral hormonal contraceptives. If tirzepatide is prescribed, use a non-oral method or add a barrier method for 4 weeks after starting and for 4 weeks after each dose increase. Current data do not show a clinically significant interaction between semaglutide and oral contraceptives."

export const THYROID_ACKNOWLEDGMENT =
  "Oral GLP-1 medication may increase levothyroxine absorption. Injectable GLP-1 medication does not significantly affect levothyroxine levels. If an oral GLP-1 is prescribed, thyroid function should be checked 4–8 weeks after starting, and the provider who manages the thyroid medication should be informed."

export const WARFARIN_ACKNOWLEDGMENT =
  "GLP-1 medication may change INR because appetite and vitamin K intake can change. The provider who manages warfarin should monitor INR more closely after treatment starts. Report unusual bleeding or bruising to that provider."

export const CONTRACEPTION_ACKNOWLEDGMENT =
  "GLP-1 medication may cause fetal harm. Semaglutide should be stopped at least 2 months before a planned pregnancy. A reliable method of contraception is recommended. If you become pregnant, stop the medication and contact your provider."

export const GLP1_MEDICATION_ACKNOWLEDGMENT = [
  "GLP-1 medication (semaglutide or tirzepatide) is prescribed for chronic weight management together with a reduced-calorie diet and increased physical activity. It is not a substitute for diet and exercise.",
  "Possible benefits include weight reduction, appetite suppression, and improved metabolic health.",
  "Possible risks include nausea, vomiting, diarrhea, constipation, abdominal pain, acid reflux, fatigue, dizziness, hair loss, gallstones, pancreatitis, kidney injury with dehydration, a possible risk of thyroid C-cell tumors based on animal studies, mood changes, and diabetic retinopathy complications in people with diabetes.",
  "These medications may cause fetal harm and must not be used during pregnancy. Semaglutide should be stopped at least 2 months before a planned pregnancy.",
  "Tirzepatide may reduce the effectiveness of oral contraceptives. A non-oral method or a barrier method is needed for 4 weeks after starting and after each dose increase.",
  "Oral GLP-1 medication may increase levothyroxine absorption. Injectable GLP-1 medication does not significantly affect levothyroxine.",
  "GLP-1 medication may affect warfarin through changes in appetite and diet. The warfarin prescriber should monitor INR more closely.",
  "The clinician decides whether treatment is appropriate and what dose is prescribed. Telehealth clearance does not guarantee approval.",
  "The information in this intake is accurate and complete.",
]

export const COMPOUNDING_ACKNOWLEDGMENT = [
  "Compounded medications are not FDA-approved. They have not undergone FDA review for safety, efficacy, or manufacturing quality.",
  "Compounded semaglutide and tirzepatide may differ from Wegovy, Ozempic, Rybelsus, Mounjaro, and Zepbound in formulation, concentration, purity, or inactive ingredients.",
  "A compounded formulation may contain additional ingredients such as B3/niacin, L-carnitine, or glycine. The effect of those ingredients on safety and effectiveness has not been studied. Vitamin B12 and vitamin B6 are not mixed into these GLP-1 formulations.",
  "The American Diabetes Association has recommended against compounded GLP-1 and dual GIP/GLP-1 products because of concerns about safety, quality, and effectiveness.",
  "There is no FDA-approved oral tirzepatide. This program prescribes compounded injectable medication. Oral compounded tirzepatide has not been studied in clinical trials.",
]

export const PREVENTIVE_ACKNOWLEDGMENT =
  "Age-appropriate preventive screenings remain the patient's responsibility with a primary care provider or specialist. The clinicians reviewing this GLP-1 intake do not manage those screenings. Contact the GLP-1 clinician about any new diagnosis, new medication, or concerning symptom, including severe abdominal pain, vision changes, allergic reaction, mood changes, suicidal thoughts, decreased urine, or a lump in the neck."

export type YesNo = "" | "yes" | "no"
export type AckChoice = "" | "ack" | "stop"
export type ConsentChoice = "" | "agree" | "decline"
export type DosePreference = "" | "decrease" | "maintain" | "increase"

export type Glp1ProtocolAnswers = {
  telehealthConsent: YesNo
  exclusions: string[]
  substanceUse: YesNo
  alcohol: string
  pregnant: YesNo
  breastfeeding: YesNo
  pregnancyPlanned: YesNo
  medications: string
  allergies: string
  oralContraceptive: YesNo
  ocpAck: AckChoice
  thyroidMed: YesNo
  thyroidAck: AckChoice
  warfarin: YesNo
  warfarinAck: AckChoice
  contraception: string
  contraceptionAck: boolean
  concerns: string[]
  priorGlp4Weeks: YesNo
  medicationPhotoKeys: string[]
  lastDoseDate: string
  takingAsPrescribed: YesNo
  takingAsPrescribedDetail: string
  dosePreference: DosePreference
  month1Preference: DosePreference
  month2Preference: DosePreference
  month3Preference: DosePreference
  glpAck: ConsentChoice
  compoundingAck: ConsentChoice
  preventiveAck: ConsentChoice
  clinicianNote: string
}

export function emptyGlp1Protocol(): Glp1ProtocolAnswers {
  return {
    telehealthConsent: "",
    exclusions: [],
    substanceUse: "",
    alcohol: "",
    pregnant: "",
    breastfeeding: "",
    pregnancyPlanned: "",
    medications: "",
    allergies: "",
    oralContraceptive: "",
    ocpAck: "",
    thyroidMed: "",
    thyroidAck: "",
    warfarin: "",
    warfarinAck: "",
    contraception: "",
    contraceptionAck: false,
    concerns: [],
    priorGlp4Weeks: "",
    medicationPhotoKeys: [],
    lastDoseDate: "",
    takingAsPrescribed: "",
    takingAsPrescribedDetail: "",
    dosePreference: "",
    month1Preference: "",
    month2Preference: "",
    month3Preference: "",
    glpAck: "",
    compoundingAck: "",
    preventiveAck: "",
    clinicianNote: "",
  }
}

export type ProtocolCheck = {
  ok: boolean
  hardStop: string
  message: string
  fields: string[]
}

const IN_PERSON =
  "Based on your answers, this medication cannot be prescribed through this online visit. Please see an in-person clinician."

function labelFor(list: readonly { id: string; label: string }[], id: string) {
  return list.find((item) => item.id === id)?.label || id
}

export function bmiBand(bmi: number): "ineligible" | "micro" | "standard" {
  if (bmi < 20) return "ineligible"
  if (bmi < 23) return "micro"
  return "standard"
}

export function validateGlp1Protocol(
  answers: Glp1ProtocolAnswers,
  options: { sex: string; threeMonth: boolean }
): ProtocolCheck {
  const fields: string[] = []
  const fail = (message: string, hardStop = ""): ProtocolCheck => ({
    ok: false,
    hardStop,
    message,
    fields,
  })

  if (answers.telehealthConsent !== "yes" && answers.telehealthConsent !== "no") {
    fields.push("telehealthConsent")
    return fail("Please answer whether you consent to a telehealth visit.")
  }
  if (answers.telehealthConsent === "no") {
    fields.push("telehealthConsent")
    return fail(IN_PERSON, IN_PERSON)
  }

  if (answers.exclusions.length === 0) {
    fields.push("exclusions")
    return fail('Please answer the medical exclusion list, including "None of the above" if none apply.')
  }
  const exclusionHits = answers.exclusions.filter((id) => id !== "none")
  if (exclusionHits.length > 0) {
    fields.push("exclusions")
    return fail(IN_PERSON, IN_PERSON)
  }

  if (answers.substanceUse !== "yes" && answers.substanceUse !== "no") {
    fields.push("substanceUse")
    return fail("Please answer the substance use question.")
  }
  if (answers.substanceUse === "yes") {
    fields.push("substanceUse")
    return fail(IN_PERSON, IN_PERSON)
  }

  if (!answers.alcohol) {
    fields.push("alcohol")
    return fail("Please answer how often you drink alcohol.")
  }
  if (answers.alcohol === "more7") {
    fields.push("alcohol")
    return fail(IN_PERSON, IN_PERSON)
  }

  for (const [key, label] of [
    ["pregnant", "Please answer whether you are currently pregnant."],
    ["breastfeeding", "Please answer whether you are currently breastfeeding."],
    ["pregnancyPlanned", "Please answer whether you are planning pregnancy in the next 2 months."],
  ] as const) {
    const value = answers[key]
    if (value !== "yes" && value !== "no") {
      fields.push(key)
      return fail(label)
    }
    if (value === "yes") {
      fields.push(key)
      const reason =
        key === "pregnancyPlanned"
          ? "This medication cannot be started through this online visit if you are planning pregnancy in the next 2 months. Semaglutide should be stopped at least 2 months before a planned pregnancy."
          : IN_PERSON
      return fail(reason, reason)
    }
  }

  if (!answers.medications.trim()) {
    fields.push("medications")
    return fail("Please list your current medications and supplements, or write None.")
  }
  if (!answers.allergies.trim()) {
    fields.push("allergies")
    return fail("Please list your allergies, or write None.")
  }

  if (answers.oralContraceptive !== "yes" && answers.oralContraceptive !== "no") {
    fields.push("oralContraceptive")
    return fail("Please answer whether you take an oral contraceptive.")
  }
  if (answers.oralContraceptive === "yes" && answers.ocpAck !== "ack") {
    fields.push("ocpAck")
    if (answers.ocpAck === "stop") {
      return fail("The oral contraceptive acknowledgment is required to continue.", "You chose not to continue after the oral contraceptive information.")
    }
    return fail("Please acknowledge the oral contraceptive information.")
  }

  if (answers.thyroidMed !== "yes" && answers.thyroidMed !== "no") {
    fields.push("thyroidMed")
    return fail("Please answer whether you take thyroid hormone medication.")
  }
  if (answers.thyroidMed === "yes" && answers.thyroidAck !== "ack") {
    fields.push("thyroidAck")
    if (answers.thyroidAck === "stop") {
      return fail("The thyroid medication acknowledgment is required to continue.", "You chose not to continue after the thyroid medication information.")
    }
    return fail("Please acknowledge the thyroid medication information.")
  }

  if (answers.warfarin !== "yes" && answers.warfarin !== "no") {
    fields.push("warfarin")
    return fail("Please answer whether you take warfarin.")
  }
  if (answers.warfarin === "yes" && answers.warfarinAck !== "ack") {
    fields.push("warfarinAck")
    if (answers.warfarinAck === "stop") {
      return fail("The warfarin acknowledgment is required to continue.", "You chose not to continue after the warfarin information.")
    }
    return fail("Please acknowledge the warfarin information.")
  }

  if (options.sex === "female") {
    if (!answers.contraception) {
      fields.push("contraception")
      return fail("Please select the contraception you are currently using.")
    }
    const needsAck =
      answers.contraception === "Not using any contraception" ||
      answers.contraception === "Barrier method (condoms, sponges, diaphragm)"
    if (needsAck && !answers.contraceptionAck) {
      fields.push("contraceptionAck")
      return fail("Please acknowledge the pregnancy risk information.")
    }
  }

  if (answers.concerns.length === 0) {
    fields.push("concerns")
    return fail('Please select each concern that applies. If none apply, select "None of these apply to me."')
  }
  if (answers.concerns.length === 1 && answers.concerns[0] === "none") {
    fields.push("concerns")
    return fail(
      'A compounded prescription cannot be offered unless at least one of the concerns above applies to you. If one does, uncheck "None of these apply to me" and select it.',
      'A compounded prescription cannot be offered unless at least one of the concerns above applies to you. If one does, uncheck "None of these apply to me" and select it.'
    )
  }
  if (answers.concerns.includes("none") && answers.concerns.length > 1) {
    fields.push("concerns")
    return fail('Uncheck "None of these apply to me" if one of the concerns above applies to you.')
  }

  if (answers.priorGlp4Weeks !== "yes" && answers.priorGlp4Weeks !== "no") {
    fields.push("priorGlp4Weeks")
    return fail("Please answer whether you have taken a GLP-1 medication in the last 4 weeks.")
  }
  if (answers.priorGlp4Weeks === "yes") {
    if (answers.medicationPhotoKeys.length === 0) {
      fields.push("medicationPhotoKeys")
      return fail("Please upload a photo of your current medication showing your name, medication, dose, frequency, and last fill date.")
    }
    if (!answers.lastDoseDate) {
      fields.push("lastDoseDate")
      return fail("Please enter the date of your last dose.")
    }
    if (answers.takingAsPrescribed !== "yes" && answers.takingAsPrescribed !== "no") {
      fields.push("takingAsPrescribed")
      return fail("Please answer whether you have been taking the medication as prescribed.")
    }
    if (answers.takingAsPrescribed === "no" && !answers.takingAsPrescribedDetail.trim()) {
      fields.push("takingAsPrescribedDetail")
      return fail("Please describe how you have been taking the medication.")
    }
  }

  const doseRequired = (value: DosePreference, field: string, message: string) => {
    if (!value) {
      fields.push(field)
      return fail(message)
    }
    return null
  }

  if (!options.threeMonth && answers.priorGlp4Weeks === "yes") {
    const missing = doseRequired(answers.dosePreference, "dosePreference", "Please select a dose preference for this prescription.")
    if (missing) return missing
  }
  if (options.threeMonth) {
    if (answers.priorGlp4Weeks === "yes") {
      const missing = doseRequired(answers.month1Preference, "month1Preference", "Please select a dose preference for the first month.")
      if (missing) return missing
    }
    const second = doseRequired(answers.month2Preference, "month2Preference", "Please select a dose preference for the second month.")
    if (second) return second
    const third = doseRequired(answers.month3Preference, "month3Preference", "Please select a dose preference for the third month.")
    if (third) return third
  }

  if (answers.glpAck !== "agree") {
    fields.push("glpAck")
    if (answers.glpAck === "decline") {
      return fail("Consent is required to continue.", "Treatment cannot continue without the GLP-1 medication acknowledgment.")
    }
    return fail("Please agree to the GLP-1 medication acknowledgment.")
  }
  if (answers.compoundingAck !== "agree") {
    fields.push("compoundingAck")
    if (answers.compoundingAck === "decline") {
      return fail("Consent is required to continue.", "Treatment cannot continue without consent to a compounded medication.")
    }
    return fail("Please consent to receiving a compounded medication.")
  }
  if (answers.preventiveAck !== "agree") {
    fields.push("preventiveAck")
    if (answers.preventiveAck === "decline") {
      return fail("Consent is required to continue.", "Treatment cannot continue without the preventive screening acknowledgment.")
    }
    return fail("Please acknowledge responsibility for preventive health screening.")
  }

  return { ok: true, hardStop: "", message: "", fields: [] }
}

export type ProtocolQuestionPair = {
  question: string
  answer: string
  options?: string[]
}

const YES_NO_OPTIONS = ["Yes", "No"]
const READ_OR_STOP_OPTIONS = [
  "I have read and understand this information",
  "I do not wish to proceed at this time",
]
const DOSE_OPTIONS = GLP1_DOSE_PREFERENCES.map((option) => option.label)

function choiceLabels(list: readonly { label: string }[]): string[] {
  return list.map((option) => option.label)
}

function asked(question: string, answer: string, options?: readonly string[]): ProtocolQuestionPair {
  return options && options.length > 0 ? { question, answer, options: [...options] } : { question, answer }
}

export function protocolQuestionPairs(
  answers: Glp1ProtocolAnswers,
  options: { sex: string; threeMonth: boolean; bmi: number | null }
): ProtocolQuestionPair[] {
  const yesNo = (value: YesNo) => (value === "yes" ? "Yes" : value === "no" ? "No" : "Not answered")
  const pairs: ProtocolQuestionPair[] = [
    asked("Do you consent to telehealth visits?", yesNo(answers.telehealthConsent), YES_NO_OPTIONS),
    asked(
      "Do you currently have, or have you ever been diagnosed with, any of the listed exclusion conditions?",
      answers.exclusions.map((id) => labelFor(GLP1_EXCLUSIONS, id)).join("; ") || "Not answered",
      choiceLabels(GLP1_EXCLUSIONS)
    ),
    asked(
      "Do you currently have an active substance use disorder, or are you in active treatment for one?",
      yesNo(answers.substanceUse),
      YES_NO_OPTIONS
    ),
    asked("How often do you drink alcohol?", labelFor(GLP1_ALCOHOL, answers.alcohol), choiceLabels(GLP1_ALCOHOL)),
    asked("Are you currently pregnant?", yesNo(answers.pregnant), YES_NO_OPTIONS),
    asked("Are you currently breastfeeding or bottle-feeding with breast milk?", yesNo(answers.breastfeeding), YES_NO_OPTIONS),
    asked("Are you planning to become pregnant within the next 2 months?", yesNo(answers.pregnancyPlanned), YES_NO_OPTIONS),
    asked("Please list all medications you currently take, including supplements.", answers.medications || "Not answered"),
    asked("Please list any allergies you have.", answers.allergies || "Not answered"),
    asked("Do you currently take an oral contraceptive?", yesNo(answers.oralContraceptive), YES_NO_OPTIONS),
  ]
  if (answers.oralContraceptive === "yes") {
    pairs.push(asked("Oral contraceptive acknowledgment", answers.ocpAck === "ack" ? "Acknowledged" : "Not acknowledged", READ_OR_STOP_OPTIONS))
  }
  pairs.push(asked("Do you currently take a thyroid hormone medication?", yesNo(answers.thyroidMed), YES_NO_OPTIONS))
  if (answers.thyroidMed === "yes") {
    pairs.push(asked("Levothyroxine acknowledgment", answers.thyroidAck === "ack" ? "Acknowledged" : "Not acknowledged", READ_OR_STOP_OPTIONS))
  }
  pairs.push(asked("Do you currently take warfarin (Coumadin)?", yesNo(answers.warfarin), YES_NO_OPTIONS))
  if (answers.warfarin === "yes") {
    pairs.push(asked("Warfarin acknowledgment", answers.warfarinAck === "ack" ? "Acknowledged" : "Not acknowledged", READ_OR_STOP_OPTIONS))
  }
  if (options.sex === "female") {
    pairs.push(asked("What form of contraception are you currently using?", answers.contraception || "Not answered", GLP1_CONTRACEPTION))
    if (
      answers.contraception === "Not using any contraception" ||
      answers.contraception === "Barrier method (condoms, sponges, diaphragm)"
    ) {
      pairs.push(
        asked(
          "Contraception and pregnancy-risk acknowledgment",
          answers.contraceptionAck ? "Acknowledged" : "Not acknowledged",
          ["I have read and understand this information"]
        )
      )
    }
  }
  pairs.push(
    asked(
      "Which compounded-medication concerns apply to you?",
      answers.concerns.map((id) => labelFor(GLP1_CONCERNS, id)).join("; ") || "Not answered",
      choiceLabels(GLP1_CONCERNS)
    )
  )
  pairs.push(asked("Have you taken GLP-1 medications in the last 4 weeks?", yesNo(answers.priorGlp4Weeks), YES_NO_OPTIONS))
  if (answers.priorGlp4Weeks === "yes") {
    pairs.push(
      asked("Date of last GLP-1 dose", answers.lastDoseDate || "Not answered"),
      asked("Have you been taking this medication as prescribed?", yesNo(answers.takingAsPrescribed), YES_NO_OPTIONS)
    )
    if (answers.takingAsPrescribed === "no") {
      pairs.push(asked("How have you been taking your medication?", answers.takingAsPrescribedDetail || "Not answered"))
    }
    pairs.push(asked("Medication label photos uploaded", String(answers.medicationPhotoKeys.length)))
  }
  const doseLabel = (value: DosePreference) => labelFor(GLP1_DOSE_PREFERENCES, value)
  if (!options.threeMonth && answers.priorGlp4Weeks === "yes") {
    pairs.push(asked("Dose preference for this prescription", doseLabel(answers.dosePreference), DOSE_OPTIONS))
  }
  if (options.threeMonth) {
    if (answers.priorGlp4Weeks === "yes") {
      pairs.push(asked("Dose preference for month 1", doseLabel(answers.month1Preference), DOSE_OPTIONS))
    } else {
      pairs.push(asked("Dose preference for month 1", "Starting dose. No GLP-1 use in the last 4 weeks."))
    }
    pairs.push(
      asked("Dose preference for month 2", doseLabel(answers.month2Preference), DOSE_OPTIONS),
      asked("Dose preference for month 3", doseLabel(answers.month3Preference), DOSE_OPTIONS)
    )
  } else if (answers.priorGlp4Weeks === "no") {
    pairs.push(asked("Dose preference for this prescription", "Starting dose. No GLP-1 use in the last 4 weeks."))
  }
  if (options.bmi != null) {
    const band = bmiBand(options.bmi)
    pairs.push({
      question: "BMI eligibility band from the GLP-1 protocol",
      answer:
        band === "ineligible"
          ? `${options.bmi.toFixed(1)} — below 20, not eligible`
          : band === "micro"
            ? `${options.bmi.toFixed(1)} — 20 to 22.9, microdosing protocol only`
            : `${options.bmi.toFixed(1)} — 23 or higher, standard dosing protocol`,
    })
  }
  const clinicianNote = answers.clinicianNote.trim().slice(0, 1000)
  pairs.push({
    question: "Optional note for the clinician",
    answer: clinicianNote || "None",
  })
  pairs.push(
    asked(
      "GLP-1 medication acknowledgment",
      answers.glpAck === "agree" ? "I agree and consent to treatment" : "Not agreed",
      ["I agree and consent to treatment", "I do not agree"]
    ),
    asked(
      "Compounding informed consent",
      answers.compoundingAck === "agree" ? "I acknowledge and consent to receiving compounded medication" : "Not agreed",
      ["I acknowledge and consent to receiving compounded medication", "I do not consent"]
    ),
    asked(
      "Preventive health screening acknowledgment",
      answers.preventiveAck === "agree" ? "I acknowledge and agree" : "Not agreed",
      ["I acknowledge and agree", "I do not agree"]
    ),
    asked("Preferred pharmacy", "Pharmacy licensed to dispense in the patient's state")
  )
  return pairs
}

export function parseGlp1Protocol(value: unknown): Glp1ProtocolAnswers {
  const empty = emptyGlp1Protocol()
  if (!value || typeof value !== "object") return empty
  const raw = value as Record<string, unknown>
  const yesNo = (key: keyof Glp1ProtocolAnswers): YesNo => {
    const item = raw[key]
    return item === "yes" || item === "no" ? item : ""
  }
  const ack = (key: keyof Glp1ProtocolAnswers): AckChoice => {
    const item = raw[key]
    return item === "ack" || item === "stop" ? item : ""
  }
  const consent = (key: keyof Glp1ProtocolAnswers): ConsentChoice => {
    const item = raw[key]
    return item === "agree" || item === "decline" ? item : ""
  }
  const dose = (key: keyof Glp1ProtocolAnswers): DosePreference => {
    const item = raw[key]
    return item === "decrease" || item === "maintain" || item === "increase" ? item : ""
  }
  const strings = (key: keyof Glp1ProtocolAnswers) =>
    Array.isArray(raw[key]) ? (raw[key] as unknown[]).filter((item): item is string => typeof item === "string") : []

  return {
    ...empty,
    telehealthConsent: yesNo("telehealthConsent"),
    exclusions: strings("exclusions"),
    substanceUse: yesNo("substanceUse"),
    alcohol: typeof raw.alcohol === "string" ? raw.alcohol : "",
    pregnant: yesNo("pregnant"),
    breastfeeding: yesNo("breastfeeding"),
    pregnancyPlanned: yesNo("pregnancyPlanned"),
    medications: typeof raw.medications === "string" ? raw.medications : "",
    allergies: typeof raw.allergies === "string" ? raw.allergies : "",
    oralContraceptive: yesNo("oralContraceptive"),
    ocpAck: ack("ocpAck"),
    thyroidMed: yesNo("thyroidMed"),
    thyroidAck: ack("thyroidAck"),
    warfarin: yesNo("warfarin"),
    warfarinAck: ack("warfarinAck"),
    contraception: typeof raw.contraception === "string" ? raw.contraception : "",
    contraceptionAck: raw.contraceptionAck === true,
    concerns: strings("concerns"),
    priorGlp4Weeks: yesNo("priorGlp4Weeks"),
    medicationPhotoKeys: strings("medicationPhotoKeys"),
    lastDoseDate: typeof raw.lastDoseDate === "string" ? raw.lastDoseDate : "",
    takingAsPrescribed: yesNo("takingAsPrescribed"),
    takingAsPrescribedDetail: typeof raw.takingAsPrescribedDetail === "string" ? raw.takingAsPrescribedDetail : "",
    dosePreference: dose("dosePreference"),
    month1Preference: dose("month1Preference"),
    month2Preference: dose("month2Preference"),
    month3Preference: dose("month3Preference"),
    glpAck: consent("glpAck"),
    compoundingAck: consent("compoundingAck"),
    preventiveAck: consent("preventiveAck"),
    clinicianNote: typeof raw.clinicianNote === "string" ? raw.clinicianNote.slice(0, 1000) : "",
  }
}
