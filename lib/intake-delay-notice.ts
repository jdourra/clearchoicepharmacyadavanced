import "server-only"

export type IntakeDelayNoticeBatchResult = {
  eligible: number
  emailed: number
  skipped: number
  failed: number
  results: Array<{
    id: string
    serviceType: string
    emailed: boolean
    skipped?: boolean
    error?: string
  }>
}

/** Patient delay emails, including the 5% courtesy offer, are no longer sent. */
export async function sendDueIntakeDelayNotices(
  _staffId?: string
): Promise<IntakeDelayNoticeBatchResult> {
  return { eligible: 0, emailed: 0, skipped: 0, failed: 0, results: [] }
}
