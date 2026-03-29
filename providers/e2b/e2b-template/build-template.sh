#!/bin/bash
# Build the E2B sandbox template with codebolt pre-installed.
# The remote-execution-plugin is bundled inside the codebolt npm package.
#
# Prerequisites:
#   - Set E2B_API_KEY in .env or environment
#
# Usage:
#   cd e2b-template
#   ./build-template.sh
#
# After building, set the template ID in:
#   - E2B_SANDBOX_TEMPLATE env var, or
#   - sandboxTemplate in codeboltprovider.yaml

set -e

cd "$(dirname "${BASH_SOURCE[0]}")"

# Install build dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing build dependencies..."
  npm install e2b dotenv tsx
fi

echo "Building E2B template using v2 SDK..."
echo ""

npx tsx build-template.ts
