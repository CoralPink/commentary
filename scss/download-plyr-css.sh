#!/bin/bash
set -euo pipefail

PLYR_VERSION=$(jq -r '.dependencies.plyr' ../js/package.json | sed 's/^[^0-9]*//')

echo "Fetching Plyr v${PLYR_VERSION} CSS..."

curl -sSL "https://cdn.jsdelivr.net/npm/plyr@${PLYR_VERSION}/dist/plyr.css" -o "dist/plyr.css"
# or...
#curl -sSL "https://cdn.plyr.io/${PLYR_VERSION}/plyr.css" -o "dist/plyr.css"

echo "✅ plyr.css updated to version $PLYR_VERSION"
