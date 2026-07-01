# AWS S3 setup — prescription & intake file storage

Clear Choice Pharmacy stores **prescription uploads**, **patient ID images**, and **specialty intake files** in a **private** S3 bucket. Files are never public; only your server reads them (admin prescription view/print).

## What you need

| Variable | Example | Purpose |
|----------|---------|---------|
| `AWS_ACCESS_KEY_ID` | `AKIA...` | IAM user access key |
| `AWS_SECRET_ACCESS_KEY` | `wJalr...` | IAM secret |
| `AWS_REGION` | `us-east-1` | Bucket region (match Neon/US East if unsure) |
| `INTAKE_ID_BUCKET` | `clearchoice-pharmacy-phi-abc123` | Globally unique bucket name |

The app already uses these in:

- `lib/order-prescription-storage.ts` — order prescription PDFs/images  
- `lib/intake-id-storage.ts` — telehealth ID uploads  
- `lib/specialty-prescription-storage.ts` — specialty intake Rx files  

---

## Step 1 — Create an IAM user (AWS Console)

1. Open [IAM Users](https://console.aws.amazon.com/iam/home#/users).
2. **Create user** → name: `clearchoice-s3-uploads`.
3. **Attach policies directly** → skip for now (we attach a custom policy after the bucket exists).
4. Create user → open user → **Security credentials** → **Create access key** → **Application running outside AWS**.
5. Copy **Access key ID** and **Secret access key** (shown once).

Add to `.env.local`:

```env
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
```

---

## Step 2 — Create the bucket (automated script)

From the project root:

```bash
npm run s3:setup
```

Optional custom name:

```bash
npm run s3:setup -- --bucket clearchoice-pharmacy-phi-yourname
```

The script will:

- Create the bucket (or reuse if it exists)
- Block all public access
- Enable AES-256 encryption
- Enable versioning
- Write `INTAKE_ID_BUCKET` and `AWS_REGION` into `.env.local`

---

## Step 3 — Lock down IAM permissions

1. Open `scripts/aws-iam-s3-policy.json`.
2. Replace `YOUR_BUCKET_NAME` with your real bucket name (both places).
3. IAM → **Policies** → **Create policy** → JSON → paste → name: `ClearChoiceS3Uploads`.
4. IAM → your user → **Add permissions** → attach `ClearChoiceS3Uploads`.

Minimum permissions: `ListBucket`, `PutObject`, `GetObject`, `DeleteObject` on that bucket only.

---

## Step 4 — Verify

```bash
npm run s3:verify
```

You should see: `S3 verify OK`.

Then restart the dev server and upload a prescription from the patient portal or checkout.

---

## Step 5 — Production (Vercel)

In [Vercel](https://vercel.com) → your project → **Settings** → **Environment Variables**, add:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `INTAKE_ID_BUCKET`

Redeploy after saving.

---

## Manual setup (AWS Console only)

If you prefer not to run the script:

1. [S3](https://s3.console.aws.amazon.com/) → **Create bucket**
2. Name: globally unique (e.g. `clearchoice-pharmacy-phi-prod`)
3. Region: `us-east-1` (or your choice)
4. **Block all public access** — ON  
5. **Bucket versioning** — Enable  
6. **Default encryption** — SSE-S3 (AES-256)  
7. Set `INTAKE_ID_BUCKET` in `.env.local` to that name  

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `INTAKE_ID_BUCKET not set` | Add variable to `.env.local` and restart `npm run dev` |
| Admin “file not available in storage” | Old uploads were dev-mode only; patient must re-upload after S3 is configured |
| `AccessDenied` on upload | IAM policy bucket name must match `INTAKE_ID_BUCKET` exactly |
| `BucketAlreadyExists` | Pick a different name with `--bucket` |

---

## HIPAA note

S3 can be used in a HIPAA context when covered by a **BAA with AWS**. Enable logging, restrict IAM, and avoid public buckets. This setup keeps objects private and encrypted at rest; work with your compliance advisor for full HIPAA program requirements.

---

## Email (SES)

Patient intake notifications use **Amazon SES** (separate from S3). See [SES_SETUP.md](./SES_SETUP.md).
