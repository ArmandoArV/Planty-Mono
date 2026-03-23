# ─── Planty-Mono Setup Script (Windows) ──────────────────
# Automates environment setup for Windows PowerShell.
# Usage: .\setup.ps1
# Requires: Node.js, Go, PostgreSQL (optional)

$ErrorActionPreference = "Stop"

function Write-Info  { param($msg) Write-Host "[INFO]  $msg" -ForegroundColor Green }
function Write-Warn  { param($msg) Write-Host "[WARN]  $msg" -ForegroundColor Yellow }
function Write-Fail  { param($msg) Write-Host "[FAIL]  $msg" -ForegroundColor Red; exit 1 }

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# ─── 1. Check Prerequisites ─────────────────────────────

Write-Info "Checking prerequisites..."

try { $null = Get-Command node -ErrorAction Stop }
catch { Write-Fail "Node.js not found. Install from https://nodejs.org" }

try { $null = Get-Command npm -ErrorAction Stop }
catch { Write-Fail "npm not found. It ships with Node.js." }

try { $null = Get-Command go -ErrorAction Stop }
catch { Write-Fail "Go not found. Install from https://go.dev/dl" }

$hasPsql = $false
try { $null = Get-Command psql -ErrorAction Stop; $hasPsql = $true }
catch { Write-Warn "psql not found - database setup will be skipped. Install PostgreSQL: https://postgresql.org/download" }

$nodeVer = node -v
$goVer = (go version) -replace 'go version ', ''
Write-Info "Node $nodeVer | $goVer"

# ─── 2. Environment Files ───────────────────────────────

function Copy-EnvFile {
    param($Source, $Destination)
    if (Test-Path $Destination) {
        Write-Info "  $Destination already exists - skipping."
    } else {
        Copy-Item $Source $Destination
        Write-Info "  Created $Destination from $(Split-Path -Leaf $Source)"
    }
}

Write-Info "Setting up environment files..."
Copy-EnvFile "$ScriptDir\backend\.env.example"  "$ScriptDir\backend\.env"
Copy-EnvFile "$ScriptDir\frontend\.env.example" "$ScriptDir\frontend\.env.local"

# ─── 3. Database ─────────────────────────────────────────

# Read env vars from backend/.env
$envFile = "$ScriptDir\backend\.env"
$DB_HOST     = "localhost"
$DB_PORT     = "5432"
$DB_USER     = "postgres"
$DB_PASSWORD = "postgres"
$DB_NAME     = "planty"

if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([A-Z_]+)\s*=\s*(.+)\s*$') {
            $key = $Matches[1]; $val = $Matches[2]
            switch ($key) {
                "DB_HOST"     { $DB_HOST     = $val }
                "DB_PORT"     { $DB_PORT     = $val }
                "DB_USER"     { $DB_USER     = $val }
                "DB_PASSWORD" { $DB_PASSWORD = $val }
                "DB_NAME"     { $DB_NAME     = $val }
            }
        }
    }
}

if ($hasPsql) {
    Write-Info "Setting up PostgreSQL database '$DB_NAME'..."
    $env:PGPASSWORD = $DB_PASSWORD

    # Check if database exists
    $dbList = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt 2>$null
    $dbExists = $dbList | Where-Object { $_ -match "\b$DB_NAME\b" }

    if ($dbExists) {
        Write-Info "  Database '$DB_NAME' already exists."
    } else {
        & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME;" 2>$null
        Write-Info "  Database '$DB_NAME' created."
    }

    Write-Info "  Running init.sql (tables, seeds, stored procedures)..."
    & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$ScriptDir\backend\init.sql" 2>&1 |
        Select-String -Pattern "ERROR|NOTICE|created" | ForEach-Object { Write-Host "    $_" }
    Write-Info "  Database schema applied."

    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
} else {
    Write-Warn "Skipping database setup (psql not available)."
    Write-Warn "Run manually:  psql -U postgres -f backend\init.sql"
}

# ─── 4. Install Frontend Dependencies ───────────────────

Write-Info "Installing frontend dependencies..."
Push-Location "$ScriptDir\frontend"
npm install --prefer-offline 2>&1 | Select-Object -Last 1
Pop-Location
Write-Info "Frontend dependencies installed."

# ─── 5. Install Backend Dependencies ────────────────────

Write-Info "Downloading Go modules..."
Push-Location "$ScriptDir\backend"
go mod download
Pop-Location
Write-Info "Go modules downloaded."

# ─── 6. Build Check ─────────────────────────────────────

Write-Info "Building backend..."
Push-Location "$ScriptDir\backend"
go build ./...
Pop-Location
Write-Info "Backend build OK."

Write-Info "Building frontend..."
Push-Location "$ScriptDir\frontend"
npm run build 2>&1 | Select-Object -Last 3
Pop-Location
Write-Info "Frontend build OK."

# ─── 7. Summary ─────────────────────────────────────────

$port = if ($env:PORT) { $env:PORT } else { "8080" }

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "    Planty-Mono Setup Complete" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Start backend:   cd backend  ; go run main.go"
Write-Host "  Start frontend:  cd frontend ; npm run dev"
Write-Host ""
Write-Host "  Backend:  http://localhost:$port/api/health"
Write-Host "  Frontend: http://localhost:3000"
Write-Host ""
Write-Host "  API docs: Import backend\Planty_API.postman_collection.json into Postman"
Write-Host ""
