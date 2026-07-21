#!/usr/bin/env bash
#
# One-time (idempotent) local dev database setup for Clear Choice Pharmacy.
#
# The app talks to the DB exclusively through @neondatabase/serverless (HTTP).
# For local dev we run a plain PostgreSQL server plus a tiny Neon-compatible
# HTTP proxy (scripts/dev/neon-local-proxy.mjs). This script:
#   1. Installs & starts PostgreSQL (if needed)
#   2. Creates the `clearchoice` database + sets the postgres password
#   3. Loads the local schema + seed data (scripts/dev/local-schema.sql)
#   4. Generates a self-signed TLS cert for the proxy (api.localtest.me)
#   5. Writes .env.local (if missing)
#
# After running this, start the proxy and dev server (see AGENTS.md):
#   sudo LOCAL_DATABASE_URL=... /path/to/node scripts/dev/neon-local-proxy.mjs
#   NODE_EXTRA_CA_CERTS=$PWD/.dev-neon-proxy/certs/cert.pem npm run dev
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CERT_DIR="$REPO_ROOT/.dev-neon-proxy/certs"
DB_NAME="clearchoice"
PG_PASSWORD="postgres"

echo "==> Ensuring PostgreSQL is installed"
if ! command -v psql >/dev/null 2>&1; then
  sudo apt-get update -qq
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq postgresql postgresql-contrib
fi

echo "==> Starting PostgreSQL cluster"
PG_VER="$(ls /etc/postgresql 2>/dev/null | sort -n | tail -1 || true)"
if [ -n "$PG_VER" ]; then
  sudo pg_ctlcluster "$PG_VER" main start 2>/dev/null || true
fi
# Wait for the server to accept connections
for _ in $(seq 1 20); do
  if sudo -u postgres psql -c "SELECT 1" >/dev/null 2>&1; then break; fi
  sleep 1
done

echo "==> Configuring postgres role + database"
sudo -u postgres psql -c "ALTER USER postgres PASSWORD '$PG_PASSWORD';" >/dev/null
if ! sudo -u postgres psql -lqt | cut -d '|' -f1 | grep -qw "$DB_NAME"; then
  sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" >/dev/null
fi

echo "==> Loading schema + seed (scripts/dev/local-schema.sql)"
PGPASSWORD="$PG_PASSWORD" psql -h 127.0.0.1 -U postgres -d "$DB_NAME" -q -f "$REPO_ROOT/scripts/dev/local-schema.sql"

echo "==> Generating self-signed TLS cert for the proxy (if missing)"
if [ ! -f "$CERT_DIR/cert.pem" ]; then
  mkdir -p "$CERT_DIR"
  openssl req -x509 -newkey rsa:2048 -nodes \
    -keyout "$CERT_DIR/key.pem" -out "$CERT_DIR/cert.pem" -days 3650 \
    -subj "/CN=api.localtest.me" \
    -addext "subjectAltName=DNS:api.localtest.me,DNS:localtest.me,DNS:db.localtest.me,IP:127.0.0.1" >/dev/null 2>&1
fi

echo "==> Writing .env.local (if missing)"
if [ ! -f "$REPO_ROOT/.env.local" ]; then
  cat > "$REPO_ROOT/.env.local" <<EOF
DATABASE_URL=postgresql://postgres:$PG_PASSWORD@db.localtest.me/$DB_NAME?sslmode=require
NEXT_PUBLIC_SITE_URL=http://localhost:3000
EOF
fi

echo ""
echo "Local DB ready. Next steps (two terminals):"
echo "  1) Start the Neon proxy (needs port 443 -> sudo):"
echo "     sudo LOCAL_DATABASE_URL=postgresql://postgres:$PG_PASSWORD@127.0.0.1:5432/$DB_NAME \\"
echo "          PROXY_CERT_DIR=$CERT_DIR $(command -v node) $REPO_ROOT/scripts/dev/neon-local-proxy.mjs"
echo "  2) Start the dev server:"
echo "     NODE_EXTRA_CA_CERTS=$CERT_DIR/cert.pem npm run dev"
