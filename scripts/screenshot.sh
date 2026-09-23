#!/usr/bin/env sh
# Regenerates screenshot/screenshot.png for the README from the running
# playground (`pnpm playground` on port 8000, or PLAYGROUND_URL).
set -e
URL="${PLAYGROUND_URL:-http://localhost:8000}/?shot=1"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
OUT="$(cd "$(dirname "$0")/.." && pwd)/screenshot/screenshot.png"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=2 \
  --window-size=1200,900 --virtual-time-budget=8000 --screenshot="$OUT" "$URL"
# Trim the empty margin under the composer (macOS sips; skip elsewhere).
command -v sips >/dev/null && sips -c 1640 2400 --cropOffset 0 0 "$OUT" >/dev/null
echo "wrote $OUT"
