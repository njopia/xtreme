#Requires -Version 5.1
<#
.SYNOPSIS
  Production build script for Xtreme L4D2.

.PARAMETER SkipInstall
  Skip npm ci (use when dependencies are already installed).

.PARAMETER Analyze
  Build with source maps + named chunks for bundle analysis.

.EXAMPLE
  .\build-prod.ps1
  .\build-prod.ps1 -SkipInstall
  .\build-prod.ps1 -Analyze
#>

param(
  [switch]$SkipInstall,
  [switch]$Analyze
)

$ErrorActionPreference = 'Stop'

# ─── Helpers ──────────────────────────────────────────────────────────────────
function Write-Banner([string]$text) {
  $bar = '─' * 62
  Write-Host ""
  Write-Host "  $bar" -ForegroundColor DarkGray
  Write-Host "  $text" -ForegroundColor Cyan
  Write-Host "  $bar" -ForegroundColor DarkGray
}

function Format-Bytes([long]$bytes) {
  if ($bytes -ge 1MB) { return "{0:N2} MB" -f ($bytes / 1MB) }
  if ($bytes -ge 1KB) { return "{0:N1} kB" -f ($bytes / 1KB) }
  return "$bytes B"
}

# ─── Config ───────────────────────────────────────────────────────────────────
$config    = if ($Analyze) { 'analysis' } else { 'production' }
$distBase  = Join-Path $PSScriptRoot 'dist\xtreme-website'
$startTime = [datetime]::UtcNow

# ─── Header ───────────────────────────────────────────────────────────────────
Write-Banner "XTREME L4D2  —  Production Build"
Write-Host ""
Write-Host "  Config   : $config" -ForegroundColor White
Write-Host "  Date     : $(Get-Date -Format 'yyyy-MM-dd HH:mm')" -ForegroundColor Gray
Write-Host "  Node     : $(node --version 2>&1)" -ForegroundColor Gray
Write-Host "  npm      : v$(npm --version 2>&1)" -ForegroundColor Gray

$ngVersion = npx ng version 2>&1 | Select-String 'Angular:' | Select-Object -First 1
if ($ngVersion) { Write-Host "  Angular  : $($ngVersion.ToString().Trim())" -ForegroundColor Gray }

# ─── Prerequisites ────────────────────────────────────────────────────────────
if (-not (Test-Path (Join-Path $PSScriptRoot 'package.json'))) {
  Write-Host ""
  Write-Host "  ERROR: Run this script from the project root." -ForegroundColor Red
  exit 1
}

# ─── Dependencies ─────────────────────────────────────────────────────────────
if (-not $SkipInstall) {
  Write-Banner "Installing dependencies"
  Write-Host ""
  npm ci --prefer-offline
  if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR: npm ci failed (exit $LASTEXITCODE)." -ForegroundColor Red
    exit 1
  }
}

# ─── Clean ────────────────────────────────────────────────────────────────────
Write-Banner "Cleaning previous output"
Write-Host ""
if (Test-Path $distBase) {
  Remove-Item -Recurse -Force $distBase
  Write-Host "  Removed: $distBase" -ForegroundColor DarkGray
} else {
  Write-Host "  Nothing to clean." -ForegroundColor DarkGray
}

# ─── Build ────────────────────────────────────────────────────────────────────
Write-Banner "Building  ($config)"
Write-Host ""
npx ng build --configuration $config
if ($LASTEXITCODE -ne 0) {
  Write-Host ""
  Write-Host "  ERROR: Build failed (exit $LASTEXITCODE)." -ForegroundColor Red
  exit 1
}

# ─── Bundle report ────────────────────────────────────────────────────────────
Write-Banner "Bundle report"
Write-Host ""

# Angular 17+ places browser files in dist/<name>/browser/
$browserDir = Join-Path $distBase 'browser'
$outputDir  = if (Test-Path $browserDir) { $browserDir } else { $distBase }

$allFiles = Get-ChildItem -Path $outputDir -Recurse -File |
  Where-Object { $_.Extension -in '.js', '.css', '.html', '.svg', '.ico', '.woff2', '.woff' } |
  Sort-Object -Property @{e = { $_.Extension }}, @{e = { $_.Length }; d = $true }

$totalBytes = 0L
$jsBytes    = 0L
$cssBytes   = 0L

$colFile  = 52
$colSize  =  9

Write-Host ("  {0,-$colFile} {1,$colSize}" -f 'File', 'Size') -ForegroundColor DarkGray
Write-Host "  $('─' * ($colFile + $colSize + 1))" -ForegroundColor DarkGray

foreach ($f in $allFiles) {
  $rel    = $f.FullName.Replace($outputDir + '\', '').Replace($outputDir + '/', '')
  $size   = $f.Length
  $totalBytes += $size

  $color = switch ($f.Extension) {
    '.js'   { $jsBytes  += $size; 'Yellow' }
    '.css'  { $cssBytes += $size; 'Cyan'   }
    '.html' { 'White' }
    '.svg'  { 'Magenta' }
    default { 'DarkGray' }
  }

  if ($rel.Length -gt $colFile) { $rel = $rel.Substring(0, $colFile - 1) + '…' }
  Write-Host ("  {0,-$colFile} {1,$colSize}" -f $rel, (Format-Bytes $size)) -ForegroundColor $color
}

Write-Host "  $('─' * ($colFile + $colSize + 1))" -ForegroundColor DarkGray
Write-Host ("  {0,-$colFile} {1,$colSize}" -f 'JavaScript',     (Format-Bytes $jsBytes))    -ForegroundColor Yellow
Write-Host ("  {0,-$colFile} {1,$colSize}" -f 'CSS',            (Format-Bytes $cssBytes))   -ForegroundColor Cyan
Write-Host ("  {0,-$colFile} {1,$colSize}" -f 'Total (all assets)', (Format-Bytes $totalBytes)) -ForegroundColor White

# ─── Gzip estimate ────────────────────────────────────────────────────────────
# JS and CSS compress to roughly 25-30% of original with gzip
$jsGzip  = [long]($jsBytes  * 0.28)
$cssGzip = [long]($cssBytes * 0.25)
Write-Host ""
Write-Host "  Estimated gzip transfer:" -ForegroundColor DarkGray
Write-Host ("  {0,-$colFile} {1,$colSize}" -f '  JavaScript (gzip ~28%)',  (Format-Bytes $jsGzip))  -ForegroundColor DarkGray
Write-Host ("  {0,-$colFile} {1,$colSize}" -f '  CSS (gzip ~25%)',         (Format-Bytes $cssGzip)) -ForegroundColor DarkGray

# ─── Summary ──────────────────────────────────────────────────────────────────
$elapsed = [datetime]::UtcNow - $startTime
Write-Banner "Done"
Write-Host ""
Write-Host ("  Build time  : {0:mm\:ss\.ff}" -f $elapsed) -ForegroundColor Green
Write-Host "  Output      : $outputDir"                    -ForegroundColor Green
Write-Host ""

if ($Analyze) {
  Write-Host "  Source maps are included. Run source-map-explorer to visualize:" -ForegroundColor Yellow
  Write-Host "    npx source-map-explorer '$outputDir\*.js'" -ForegroundColor DarkGray
  Write-Host ""
}

Write-Host "  Next steps for deployment:" -ForegroundColor White
Write-Host "    1. Copy contents of '$outputDir' to your Nginx web root" -ForegroundColor DarkGray
Write-Host "    2. Confirm Nginx has 'try_files `$uri `$uri/ /index.html' for SPA routing" -ForegroundColor DarkGray
Write-Host "    3. Enable gzip and browser caching for static assets in Nginx" -ForegroundColor DarkGray
Write-Host ""
