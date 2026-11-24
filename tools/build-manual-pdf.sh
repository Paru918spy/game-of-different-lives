#!/bin/sh
# node tools/build-manual.js first, then: sh tools/build-manual-pdf.sh  (needs Chrome/Chromium)
set -e
cd "$(dirname "$0")/.."
CH=${CHROME:-$(command -v google-chrome || command -v chromium || command -v chromium-browser)}
mkdir -p manual
for L in en de; do
  OUT=manual/Game-of-Different-Lives-Manual-EN.pdf; [ $L = de ] && OUT=manual/Game-of-Different-Lives-Spielanleitung-DE.pdf
  "$CH" --headless --no-sandbox --disable-gpu --no-pdf-header-footer --print-to-pdf="$OUT" "file://$PWD/manual.html?lang=$L" 2>/dev/null
  echo "$OUT"
done
