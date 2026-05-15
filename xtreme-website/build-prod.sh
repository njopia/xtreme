#!/usr/bin/env bash
# Production build script for Xtreme L4D2 (Linux / Debian)
#
# Usage:
#   ./build-prod.sh               # full build
#   ./build-prod.sh --skip-install
#   ./build-prod.sh --analyze     # includes source maps for bundle inspection
set -euo pipefail

# ─── Colors ───────────────────────────────────────────────────────────────────
CYAN='\033[0;36m' YELLOW='\033[1;33m' GREEN='\033[0;32m'
WHITE='\033[1;37m' GRAY='\033[0;37m' RED='\033[0;31m' RESET='\033[0m'

# ─── Args ─────────────────────────────────────────────────────────────────────
SKIP_INSTALL=false
ANALYZE=false
for arg in "$@"; do
  case $arg in
    --skip-install) SKIP_INSTALL=true ;;
    --analyze)      ANALYZE=true ;;
    *) echo -e "${RED}Unknown argument: $arg${RESET}"; exit 1 ;;
  esac
done

CONFIG=$( [ "$ANALYZE" = true ] && echo "analysis" || echo "production" )
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIST_BASE="$SCRIPT_DIR/dist/xtreme-website"
START_TIME=$(date +%s)

# ─── Helpers ──────────────────────────────────────────────────────────────────
banner() {
  local bar
  bar=$(printf '─%.0s' {1..62})
  echo ""
  echo -e "  ${GRAY}$bar${RESET}"
  echo -e "  ${CYAN}$1${RESET}"
  echo -e "  ${GRAY}$bar${RESET}"
}

format_bytes() {
  local bytes=$1
  if   (( bytes >= 1048576 )); then awk "BEGIN{printf \"%.2f MB\", $bytes/1048576}"
  elif (( bytes >= 1024    )); then awk "BEGIN{printf \"%.1f kB\", $bytes/1024}"
  else echo "${bytes} B"
  fi
}

# ─── Header ───────────────────────────────────────────────────────────────────
banner "XTREME L4D2  —  Production Build"
echo ""
echo -e "  Config   : ${WHITE}$CONFIG${RESET}"
echo -e "  Date     : ${GRAY}$(date '+%Y-%m-%d %H:%M')${RESET}"
echo -e "  Node     : ${GRAY}$(node --version)${RESET}"
echo -e "  npm      : ${GRAY}v$(npm --version)${RESET}"

# ─── Prerequisites ────────────────────────────────────────────────────────────
if [ ! -f "$SCRIPT_DIR/package.json" ]; then
  echo -e "${RED}  ERROR: Run this script from the project root.${RESET}"
  exit 1
fi

# ─── Dependencies ─────────────────────────────────────────────────────────────
if [ "$SKIP_INSTALL" = false ]; then
  banner "Installing dependencies"
  echo ""
  npm ci --prefer-offline
fi

# ─── Clean ────────────────────────────────────────────────────────────────────
banner "Cleaning previous output"
echo ""
if [ -d "$DIST_BASE" ]; then
  rm -rf "$DIST_BASE"
  echo -e "  ${GRAY}Removed: $DIST_BASE${RESET}"
else
  echo -e "  ${GRAY}Nothing to clean.${RESET}"
fi

# ─── Build ────────────────────────────────────────────────────────────────────
banner "Building  ($CONFIG)"
echo ""
npx ng build --configuration "$CONFIG"

# ─── Bundle report ────────────────────────────────────────────────────────────
banner "Bundle report"
echo ""

BROWSER_DIR="$DIST_BASE/browser"
OUTPUT_DIR=$( [ -d "$BROWSER_DIR" ] && echo "$BROWSER_DIR" || echo "$DIST_BASE" )

TOTAL=0; JS_TOTAL=0; CSS_TOTAL=0
COL_FILE=52; COL_SIZE=9

printf "  %-${COL_FILE}s %${COL_SIZE}s\n" "File" "Size"
printf "  %s\n" "$(printf '─%.0s' $(seq 1 $((COL_FILE + COL_SIZE + 1))))"

while IFS= read -r -d '' file; do
  rel="${file#$OUTPUT_DIR/}"
  size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file")
  TOTAL=$((TOTAL + size))

  ext="${file##*.}"
  color=$GRAY
  case $ext in
    js)   JS_TOTAL=$((JS_TOTAL + size));  color=$YELLOW ;;
    css)  CSS_TOTAL=$((CSS_TOTAL + size)); color=$CYAN  ;;
    html) color=$WHITE ;;
  esac

  # Truncate long filenames
  if (( ${#rel} > COL_FILE )); then rel="${rel:0:$((COL_FILE-1))}…"; fi
  printf "  ${color}%-${COL_FILE}s %${COL_SIZE}s${RESET}\n" "$rel" "$(format_bytes $size)"

done < <(find "$OUTPUT_DIR" -type f \( \
  -name '*.js' -o -name '*.css' -o -name '*.html' \
  -o -name '*.svg' -o -name '*.ico' -o -name '*.woff2' \) \
  -print0 | sort -z)

printf "  %s\n" "$(printf '─%.0s' $(seq 1 $((COL_FILE + COL_SIZE + 1))))"
printf "  ${YELLOW}%-${COL_FILE}s %${COL_SIZE}s${RESET}\n" "JavaScript"       "$(format_bytes $JS_TOTAL)"
printf "  ${CYAN}%-${COL_FILE}s %${COL_SIZE}s${RESET}\n"   "CSS"              "$(format_bytes $CSS_TOTAL)"
printf "  ${WHITE}%-${COL_FILE}s %${COL_SIZE}s${RESET}\n"  "Total (all assets)" "$(format_bytes $TOTAL)"

# Gzip estimates (~28% for JS, ~25% for CSS)
JS_GZ=$(awk "BEGIN{printf \"%d\", $JS_TOTAL*0.28}")
CSS_GZ=$(awk "BEGIN{printf \"%d\", $CSS_TOTAL*0.25}")
echo ""
echo -e "  ${GRAY}Estimated gzip transfer:${RESET}"
printf "  ${GRAY}%-${COL_FILE}s %${COL_SIZE}s${RESET}\n" "  JavaScript (gzip ~28%)" "$(format_bytes $JS_GZ)"
printf "  ${GRAY}%-${COL_FILE}s %${COL_SIZE}s${RESET}\n" "  CSS (gzip ~25%)"        "$(format_bytes $CSS_GZ)"

# ─── Summary ──────────────────────────────────────────────────────────────────
END_TIME=$(date +%s)
ELAPSED=$((END_TIME - START_TIME))
banner "Done"
echo ""
echo -e "  ${GREEN}Build time  : ${ELAPSED}s${RESET}"
echo -e "  ${GREEN}Output      : $OUTPUT_DIR${RESET}"
echo ""

if [ "$ANALYZE" = true ]; then
  echo -e "  ${YELLOW}Source maps included. Run source-map-explorer to inspect bundles:${RESET}"
  echo -e "  ${GRAY}  npx source-map-explorer '$OUTPUT_DIR/*.js'${RESET}"
  echo ""
fi

echo -e "  ${WHITE}Next steps for deployment:${RESET}"
echo -e "  ${GRAY}  1. Copy contents of '$OUTPUT_DIR' to your Nginx web root${RESET}"
echo -e "  ${GRAY}  2. Confirm Nginx has 'try_files \$uri \$uri/ /index.html' for SPA routing${RESET}"
echo -e "  ${GRAY}  3. Enable gzip and browser caching for static assets in Nginx${RESET}"
echo ""
