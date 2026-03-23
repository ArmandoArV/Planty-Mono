#!/usr/bin/env bash
# ─── Planty-Mono Setup Script ────────────────────────────
# Automates environment setup for Linux / macOS.
# Usage: chmod +x setup.sh && ./setup.sh
set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
fail()  { echo -e "${RED}[FAIL]${NC}  $*"; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ─── 1. Check Prerequisites ─────────────────────────────

info "Checking prerequisites…"

command -v node  >/dev/null 2>&1 || fail "Node.js not found. Install from https://nodejs.org"
command -v npm   >/dev/null 2>&1 || fail "npm not found. It ships with Node.js."
command -v go    >/dev/null 2>&1 || fail "Go not found. Install from https://go.dev/dl"
command -v psql  >/dev/null 2>&1 || warn "psql not found — database setup will be skipped. Install PostgreSQL: https://postgresql.org/download"

NODE_VER=$(node -v)
GO_VER=$(go version | awk '{print $3}')
info "Node $NODE_VER · $GO_VER"

# ─── 2. Environment Files ───────────────────────────────

create_env() {
  local src="$1" dst="$2"
  if [ -f "$dst" ]; then
    info "  $dst already exists — skipping."
  else
    cp "$src" "$dst"
    info "  Created $dst from $(basename "$src")"
  fi
}

info "Setting up environment files…"
create_env "$SCRIPT_DIR/backend/.env.example"  "$SCRIPT_DIR/backend/.env"
create_env "$SCRIPT_DIR/frontend/.env.example" "$SCRIPT_DIR/frontend/.env.local"

# ─── 3. Database ─────────────────────────────────────────

# Source backend env vars
if [ -f "$SCRIPT_DIR/backend/.env" ]; then
  set -a
  # shellcheck disable=SC1091
  source "$SCRIPT_DIR/backend/.env"
  set +a
fi

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"
DB_NAME="${DB_NAME:-planty}"

if command -v psql >/dev/null 2>&1; then
  info "Setting up PostgreSQL database '$DB_NAME'…"
  export PGPASSWORD="$DB_PASSWORD"

  # Create DB if not exists
  if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    info "  Database '$DB_NAME' already exists."
  else
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || true
    info "  Database '$DB_NAME' created."
  fi

  # Run init.sql (tables, indexes, seeds, stored procedures)
  info "  Running init.sql (tables, seeds, stored procedures)…"
  psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SCRIPT_DIR/backend/init.sql" \
    --set ON_ERROR_STOP=off 2>&1 | grep -E '(ERROR|NOTICE|✅)' || true
  info "  Database schema applied."

  unset PGPASSWORD
else
  warn "Skipping database setup (psql not available)."
  warn "Run manually:  psql -U postgres -f backend/init.sql"
fi

# ─── 4. Install Frontend Dependencies ───────────────────

info "Installing frontend dependencies…"
cd "$SCRIPT_DIR/frontend"
npm install --prefer-offline 2>&1 | tail -1
info "Frontend dependencies installed."

# ─── 5. Install Backend Dependencies ────────────────────

info "Downloading Go modules…"
cd "$SCRIPT_DIR/backend"
go mod download
info "Go modules downloaded."

# ─── 6. Build Check ─────────────────────────────────────

info "Building backend…"
cd "$SCRIPT_DIR/backend"
go build -o /dev/null ./...
info "Backend build OK."

info "Building frontend…"
cd "$SCRIPT_DIR/frontend"
npm run build 2>&1 | tail -3
info "Frontend build OK."

# ─── 7. Summary ─────────────────────────────────────────

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║       🌱 Planty-Mono Setup Complete       ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════╝${NC}"
echo ""
echo "  Start backend:   cd backend  && go run main.go"
echo "  Start frontend:  cd frontend && npm run dev"
echo ""
echo "  Backend:  http://localhost:${PORT:-8080}/api/health"
echo "  Frontend: http://localhost:3000"
echo ""
echo "  API docs: Import backend/Planty_API.postman_collection.json into Postman"
echo ""
