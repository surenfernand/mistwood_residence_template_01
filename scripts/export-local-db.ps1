# Export local Mistwood Postgres for restore on Coolify.
# Requires PostgreSQL client tools (pg_dump) on PATH — install from:
# https://www.postgresql.org/download/windows/ (Command Line Tools only is enough).
#
# Usage:
#   .\scripts\export-local-db.ps1
#   .\scripts\export-local-db.ps1 -DatabaseUrl "postgresql://user:pass@127.0.0.1:5433/mistwood"

param(
  [string]$DatabaseUrl = "",
  [string]$OutFile = ""
)

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent

$envFile = Join-Path $root ".env"
if (-not $DatabaseUrl -and (Test-Path $envFile)) {
  foreach ($line in Get-Content $envFile) {
    if ($line -match '^\s*DATABASE_URL\s*=\s*(.+)\s*$') {
      $DatabaseUrl = $Matches[1].Trim().Trim('"').Trim("'")
      break
    }
  }
}

if (-not $DatabaseUrl) {
  Write-Host "Set DATABASE_URL in .env or pass -DatabaseUrl"
  exit 1
}

if (-not (Get-Command pg_dump -ErrorAction SilentlyContinue)) {
  Write-Host "pg_dump not found. Install PostgreSQL client tools and retry."
  exit 1
}

$uri = [Uri]$DatabaseUrl
$user = [Uri]::UnescapeDataString($uri.UserInfo.Split(":")[0])
$pass = ""
if ($uri.UserInfo.Contains(":")) {
  $pass = [Uri]::UnescapeDataString($uri.UserInfo.Substring($user.Length + 1))
}
$hostName = $uri.Host
$port = if ($uri.Port -gt 0) { $uri.Port } else { 5432 }
$db = $uri.AbsolutePath.TrimStart("/")

$backupDir = Join-Path $root "backups"
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
if (-not $OutFile) {
  $stamp = Get-Date -Format "yyyyMMdd-HHmm"
  $OutFile = Join-Path $backupDir "mistwood-$stamp.dump"
}

$env:PGPASSWORD = $pass
try {
  & pg_dump -h $hostName -p $port -U $user -d $db -Fc --no-owner --no-acl -f $OutFile
  Write-Host "Wrote $($OutFile) ($(('{0:N1}' -f ((Get-Item $OutFile).Length / 1MB)) MB))"
  Write-Host ""
  Write-Host "Next: enable public access on Coolify Postgres (or use SSH), then run:"
  Write-Host '  pg_restore -h COOLIFY_HOST -p COOLIFY_PORT -U DB_USER -d DB_NAME --clean --if-exists --no-owner --no-acl "' + $OutFile + '"'
} finally {
  Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}
