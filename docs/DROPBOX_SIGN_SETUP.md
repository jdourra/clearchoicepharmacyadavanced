# Dropbox Sign — clinical prescription e-sign

On intake **Approve**, Clear Choice generates a pharmacy Rx PDF and either:

1. **Dropbox Sign configured** — emails the clinician (Dr. Dourra) a signature request; when signed, stores the PDF and emails `ADMIN_EMAIL` that the Rx is ready to print.
2. **Not configured** — requires a typed clinician e-sign name on approve, stores a signed PDF, and emails the admin immediately.

## Env vars

Add to `.env.local` / Vercel (see `.env.local.example`):

| Variable | Purpose |
|---|---|
| `DROPBOX_SIGN_API_KEY` | API key from [Dropbox Sign API settings](https://app.hellosign.com/Home/ApiKeyPage) |
| `DROPBOX_SIGN_CLIENT_ID` | Optional API app client ID |
| `DROPBOX_SIGN_TEST_MODE` | `true` (default) for test signatures; `false` for production |
| `TELEHEALTH_CLINICIAN_EMAIL` / `DR_DOURRA_EMAIL` | Signer email for Dropbox Sign |
| `PRESCRIBER_LICENSE` | MI license # printed on Rx |
| `PRESCRIBER_NPI` | NPI printed on Rx |
| `ADMIN_EMAIL` | Receives “Rx ready to print” |

## Database

```bash
psql "$DATABASE_URL" -f scripts/032_clinical_prescriptions.sql
```

## Callback URL

In Dropbox Sign account (or API app) settings, set the callback URL to:

`https://clearchoicepharmacy.com/api/webhooks/dropbox-sign`

The endpoint acknowledges with the required body: `Hello API Event Received`.

## Print

Admin: open the intake → existing Rx → **Open PDF**, or
`GET /api/admin/prescriptions/{id}/pdf` (staff auth required).
