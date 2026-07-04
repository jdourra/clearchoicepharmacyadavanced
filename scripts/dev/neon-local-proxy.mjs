/**
 * Neon-compatible HTTP proxy for LOCAL DEVELOPMENT ONLY.
 *
 * The app talks to the database exclusively through @neondatabase/serverless,
 * which sends every query as an HTTPS POST to `https://api.<host>/sql`.
 * There is no Neon cloud database in local dev, so this tiny proxy implements
 * that same HTTP protocol and forwards each query to a plain local PostgreSQL
 * instance via `pg`.
 *
 * Because the driver derives the endpoint host from the connection string
 * (first DNS label replaced with "api."), setting
 *   DATABASE_URL=postgresql://...@db.localtest.me/<db>
 * makes the driver POST to https://api.localtest.me/sql, which resolves to
 * localhost. This proxy serves that endpoint over TLS (self-signed cert; the
 * app process trusts it via NODE_EXTRA_CA_CERTS).
 *
 * No application code is modified: only DATABASE_URL and NODE_EXTRA_CA_CERTS
 * are configured (see .env.local / AGENTS.md).
 */
import { createServer } from "node:https"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import pg from "pg"

const __dirname = dirname(fileURLToPath(import.meta.url))

const PORT = Number(process.env.PROXY_PORT || 443)
const LOCAL_DATABASE_URL =
  process.env.LOCAL_DATABASE_URL ||
  "postgresql://postgres:postgres@127.0.0.1:5432/clearchoice"
const CERT_DIR = process.env.PROXY_CERT_DIR || join(__dirname, "..", "..", ".dev-neon-proxy", "certs")

// Return every column value as the raw text string; the Neon driver applies its
// own pg-types parsers client-side (Neon-Raw-Text-Output + Neon-Array-Mode).
const RAW_TEXT_TYPES = { getTypeParser: () => (val) => val }

const pool = new pg.Pool({ connectionString: LOCAL_DATABASE_URL, max: 10 })

async function runQuery({ query, params }) {
  const result = await pool.query({
    text: query,
    values: params || [],
    rowMode: "array",
    types: RAW_TEXT_TYPES,
  })
  return {
    command: result.command,
    rowCount: result.rowCount,
    rows: result.rows,
    fields: (result.fields || []).map((f) => ({
      name: f.name,
      dataTypeID: f.dataTypeID,
      tableID: f.tableID,
      columnID: f.columnID,
      dataTypeSize: f.dataTypeSize,
      dataTypeModifier: f.dataTypeModifier,
      format: "text",
    })),
    rowAsArray: true,
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on("data", (c) => chunks.push(c))
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")))
    req.on("error", reject)
  })
}

const server = createServer(
  {
    key: readFileSync(join(CERT_DIR, "key.pem")),
    cert: readFileSync(join(CERT_DIR, "cert.pem")),
  },
  async (req, res) => {
    if (req.method === "GET") {
      res.writeHead(200, { "content-type": "application/json" })
      res.end(JSON.stringify({ ok: true, proxy: "neon-local-proxy" }))
      return
    }

    try {
      const raw = await readBody(req)
      const payload = raw ? JSON.parse(raw) : {}

      let responseBody
      if (Array.isArray(payload.queries)) {
        const results = []
        for (const q of payload.queries) {
          results.push(await runQuery(q))
        }
        responseBody = { results }
      } else {
        responseBody = await runQuery(payload)
      }

      res.writeHead(200, { "content-type": "application/json" })
      res.end(JSON.stringify(responseBody))
    } catch (err) {
      const message = err?.message || String(err)
      console.error("[neon-local-proxy] query error:", message)
      res.writeHead(400, { "content-type": "application/json" })
      res.end(
        JSON.stringify({
          message,
          code: err?.code,
          detail: err?.detail,
          hint: err?.hint,
          severity: "ERROR",
        })
      )
    }
  }
)

server.listen(PORT, "::", () => {
  console.log(`[neon-local-proxy] listening on https://api.localtest.me:${PORT}/sql`)
  console.log(`[neon-local-proxy] forwarding to ${LOCAL_DATABASE_URL.replace(/:[^:@/]+@/, ":****@")}`)
})
