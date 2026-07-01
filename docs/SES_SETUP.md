# AWS SES setup — patient & clinician email

Clear Choice Pharmacy uses **Amazon SES** for:

- **Patient emails** when Dr. Dourra approves / denies / requests follow-up on a clinical intake
- **Clinician alert** when a new intake is submitted (optional inbox for `DR_DOURRA_EMAIL`)

**Admin order messages** (prescription ready, payment request) are **in-app only** in the patient portal — they do not use SES unless you add that later.

---

## What you need

| Variable | Example | Purpose |
|----------|---------|---------|
| `AWS_ACCESS_KEY_ID` | `AKIA...` | Same IAM user as S3 (or dedicated user) |
| `AWS_SECRET_ACCESS_KEY` | `...` | IAM secret |
| `AWS_REGION` | `us-east-2` | Must match SES region (often same as S3) |
| `SES_SENDER_EMAIL` | `intake@clearchoicepharmacy.com` | **Verified** From address in SES |
| `DR_DOURRA_EMAIL` | `dr@example.com` | New-intake alerts + test recipient |
| `TELEHEALTH_CLINICIAN_EMAIL` | (optional) | Overrides Dr. Dourra for clinician inbox |

Add the same vars to **Vercel → Project → Environment Variables** for production.

---

## Step 1 — Verify sender in SES

1. Open [Amazon SES](https://console.aws.amazon.com/ses/) (choose the same region as `AWS_REGION`, e.g. **US East Ohio**).
2. **Verified identities** → **Create identity**.
3. Recommended: **Domain** → `clearchoicepharmacy.com` (allows any `@clearchoicepharmacy.com` sender after DNS records are added).
4. Or: **Email address** → e.g. `intake@clearchoicepharmacy.com` (click verification link in inbox).
5. Set `SES_SENDER_EMAIL` to that address.

---

## Step 2 — Sandbox vs production

New SES accounts start in **sandbox**:

- You can only send **to verified email addresses**.
- Request **production access**: SES → **Account dashboard** → **Request production access**.

Until production is approved, verify each test patient email under **Verified identities**, or test only with verified addresses.

---

## Step 3 — IAM permissions

Your IAM user needs **SES send** in addition to S3.

**Option A — combined S3 + SES** (edit bucket name in JSON):

- Attach policy from `scripts/aws-iam-s3-ses-policy.json`

**Option B — SES only:**

- Attach policy from `scripts/aws-iam-ses-policy.json`

**Option C — quick test:**

- Attach AWS managed policy **AmazonSESFullAccess** (tighten later).

---

## Step 4 — `.env.local`

```env
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
INTAKE_ID_BUCKET=clearchoice-pharmacy-2026s

SES_SENDER_EMAIL=intake@clearchoicepharmacy.com
DR_DOURRA_EMAIL=dr.dourra@yourdomain.com
# Optional test recipient for npm run ses:verify
SES_VERIFY_TO=you@example.com
```

---

## Step 5 — Verify locally

```bash
npm run ses:verify
```

Or send to a specific inbox:

```bash
npm run ses:verify -- --to you@example.com
```

Success: `SES verify OK — check the inbox (and spam)`.

---

## Step 6 — Production (Vercel)

1. Add all `AWS_*`, `SES_SENDER_EMAIL`, and `DR_DOURRA_EMAIL` to Vercel env vars.
2. **Redeploy** (env vars apply on next deployment).
3. Approve a test intake → patient should receive approval email.

Check **Vercel → Logs** if email fails:

- `SES not configured` → missing AWS keys on Vercel
- `SES error` / `AccessDenied` → IAM missing `ses:SendEmail`
- `MessageRejected` / not verified → sandbox or unverified sender/recipient

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Patient didn't get order message | Order messages are **portal only** — patient logs in → Account → Messages |
| Patient didn't get intake approval email | Set up SES + Vercel env; check logs |
| `Email address is not verified` | Verify sender and recipient in SES (sandbox) |
| `AccessDenied` on send | Attach `aws-iam-ses-policy.json` to IAM user |
| Email in spam | Set up SPF/DKIM/DMARC for your domain in SES |

---

## Related

- S3 file storage: [S3_SETUP.md](./S3_SETUP.md)
- Intake review flow: approve → `notifyPatientIntakeDecision` in `lib/telehealth/patient-notify.ts`
