# AGENTS.md

## Cursor Cloud specific instructions

Clear Choice Pharmacy is a single **Next.js 16 (App Router, Turbopack) + React 19**
app. It is a cash-pay pharmacy / telehealth site: marketing pages, a medication
price-quote builder, patient auth + portal, cart/checkout (Stripe), intake forms,
and a staff/admin console. Standard scripts live in `package.json` (`dev`, `build`,
`start`, `lint`, `db:migrate:*`, `s3:*`, `ses:*`, `stripe:*`).

### Data layer / local database (important, non-obvious)
- All DB access goes through `@neondatabase/serverless` (`lib/db.ts` and a few API
  routes call `neon(DATABASE_URL)`). That driver does **not** open a TCP Postgres
  connection — it sends every query as an HTTPS `POST` to `https://api.<host>/sql`
  (the first DNS label of the connection-string host is replaced with `api.`).
- There is **no local Postgres wire protocol path**; to run the app locally you need
  a Neon-style HTTP endpoint. This repo ships a tiny Neon-compatible proxy that
  fronts a plain local PostgreSQL:
  - `scripts/dev/neon-local-proxy.mjs` — serves `/sql` over TLS and forwards to `pg`.
  - `scripts/dev/local-schema.sql` — local schema + seed (25 common medications, an
    `admin@clearchoice.com` / `admin123` staff user). **Note:** the historical
    `scripts/0xx_*.sql` migrations are stale and use Supabase `auth.uid()` RLS +
    different column names; do **not** load them for local dev — they do not match
    the columns the current code expects (`medications.name`/`dosage_form`/`our_price`,
    `patients.date_of_birth`/`zip_code`, `staff_users.full_name`/`is_active`, …).
  - `scripts/dev/setup-local-db.sh` — idempotent: installs/starts Postgres, creates
    the `clearchoice` DB, loads the schema/seed, generates the proxy TLS cert, and
    writes `.env.local`.

### Running the app locally (services)
Postgres install + service startup are **not** in the update script (they are system
services), so run them per session:
1. `bash scripts/dev/setup-local-db.sh`
2. Start the proxy (needs port 443 → sudo; `node` is at `/exec-daemon/node`):
   `sudo LOCAL_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/clearchoice PROXY_CERT_DIR=$PWD/.dev-neon-proxy/certs /exec-daemon/node scripts/dev/neon-local-proxy.mjs`
3. Start the dev server (run these in tmux so they persist):
   `NODE_EXTRA_CA_CERTS=$PWD/.dev-neon-proxy/certs/cert.pem npm run dev`
- **Gotcha:** `NODE_EXTRA_CA_CERTS` must be set in the shell that launches `npm run dev`
  (and `npm run build`). It is read at Node startup — putting it in `.env.local` does
  **not** work. Without it, the dev server's `fetch` to the proxy fails TLS verification
  and every DB query errors.
- `db.localtest.me` / `api.localtest.me` resolve to localhost; the proxy listens on `::`.
- Verify the stack: `curl -s http://localhost:3000/api/test-db` should return
  `"Neon database connection working"` with a non-zero `totalCount`.

### Build / lint
- `npm run build` succeeds and requires the DB env vars above (some API route modules
  throw at import if `DATABASE_URL` is unset). `next.config.mjs` sets
  `typescript.ignoreBuildErrors: true`, so type errors do not fail the build.
- `npm run lint` (`eslint .`) is **not runnable as-is**: `eslint` is not a dependency
  and there is no ESLint config in the repo. Treat lint as unconfigured unless you add
  ESLint yourself.

### Optional integrations
Stripe (`STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`),
AWS S3 (prescription/ID uploads) and AWS SES (intake emails) are only needed for
checkout/upload/email flows. Browsing, medication pricing, and patient auth work
without them. See `docs/S3_SETUP.md`, `docs/SES_SETUP.md`, and `.env.local.example`.
