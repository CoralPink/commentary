#!/bin/bash
set -euo pipefail

# TODO: Ideally, we should retrieve the version actually in use, but for now, we'll use a fixed value.
PLYR_VERSION="3.8.4"

echo "Fetching Plyr v${PLYR_VERSION} CSS..."

curl -sSL "https://cdn.jsdelivr.net/npm/plyr@${PLYR_VERSION}/dist/plyr.css" -o "dist/plyr.css"
# or...
#curl -sSL "https://cdn.plyr.io/${PLYR_VERSION}/plyr.css" -o "dist/plyr.css"

echo "✅ plyr.css updated to version $PLYR_VERSION"
