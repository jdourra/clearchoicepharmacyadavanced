export type EdContraindicationFlags = {
  takesNitrates: boolean
  takesRiociguat: boolean
  recentHeartAttack: boolean
  recentStroke: boolean
  severeHeartFailure: boolean
  unstableAngina: boolean
}

export function checkBloodPressureHardStop(
  systolic: number,
  diastolic: number
): { isHardStop: boolean; reason: string } {
  if (systolic < 90 || diastolic < 50) {
    return {
      isHardStop: true,
      reason:
        "Your blood pressure appears to be dangerously low (below 90/50). ED medications can further lower blood pressure and may not be safe for you.",
    }
  }
  if (systolic > 170 || diastolic > 100) {
    return {
      isHardStop: true,
      reason:
        "Your blood pressure appears to be dangerously high (above 170/100). Please seek medical evaluation to manage your blood pressure before considering ED treatment.",
    }
  }
  return { isHardStop: false, reason: "" }
}

export function checkEdContraindicationHardStop(
  flags: EdContraindicationFlags
): { isHardStop: boolean; reason: string } {
  if (flags.takesNitrates) {
    return {
      isHardStop: true,
      reason:
        "You indicated you take nitrates (such as nitroglycerin). Combining ED medications with nitrates can cause a severe, potentially life-threatening drop in blood pressure.",
    }
  }
  if (flags.takesRiociguat) {
    return {
      isHardStop: true,
      reason:
        "You indicated you take Riociguat (Adempas). This medication is contraindicated with PDE5 inhibitors used in ED treatment.",
    }
  }
  if (flags.recentHeartAttack || flags.recentStroke || flags.severeHeartFailure || flags.unstableAngina) {
    return {
      isHardStop: true,
      reason:
        "Based on your answers, ED medication may not be safe without an in-person evaluation. Please contact your physician or seek emergency care if you have active symptoms.",
    }
  }
  return { isHardStop: false, reason: "" }
}
