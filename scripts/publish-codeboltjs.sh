#!/bin/bash
set -e

# Script to publish only @codebolt/codeboltjs to npm
# Usage: ./scripts/publish-codeboltjs.sh [patch|minor|major|skip]
#   - patch/minor/major: Create a changeset and bump version
#   - skip: Skip versioning and publish current version

cd "$(dirname "$0")/.."

VERSION_TYPE=${1:-patch}

echo "🚀 Publishing @codebolt/codeboltjs to npm"
echo "📦 Version bump type: $VERSION_TYPE"

# Step 1: Build the package
echo ""
echo "📦 Building @codebolt/codeboltjs..."
pnpm --filter @codebolt/codeboltjs run build

# Step 2: Check for existing changesets
EXISTING_CHANGESETS=$(find .changeset -name "*.md" ! -name "README.md" 2>/dev/null | wc -l | tr -d ' ')
if [ "$EXISTING_CHANGESETS" -gt 0 ] && [ -t 0 ]; then
  echo ""
  echo "⚠️  Warning: Found $EXISTING_CHANGESETS existing changeset(s)"
  echo "   These will also be versioned. Only @codebolt/codeboltjs will be published."
  read -p "   Continue? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled"
    exit 1
  fi
elif [ "$EXISTING_CHANGESETS" -gt 0 ]; then
  echo ""
  echo "⚠️  Warning: Found $EXISTING_CHANGESETS existing changeset(s)"
  echo "   These will also be versioned. Only @codebolt/codeboltjs will be published."
fi

# Step 3: Create a changeset for @codebolt/codeboltjs (if you want a new version)
if [ "$VERSION_TYPE" != "skip" ]; then
  echo ""
  echo "📝 Creating changeset for @codebolt/codeboltjs..."
  CHANGESET_FILE=".changeset/publish-codeboltjs-$(date +%s).md"
  cat > "$CHANGESET_FILE" << EOF
---
"@codebolt/codeboltjs": $VERSION_TYPE
---

Publish @codebolt/codeboltjs package
EOF
  echo "✅ Created changeset: $CHANGESET_FILE"
fi

# Step 4: Version packages (if we created a changeset or if there are existing ones)
if [ "$VERSION_TYPE" != "skip" ] || [ "$EXISTING_CHANGESETS" -gt 0 ]; then
  echo ""
  echo "🔢 Versioning packages..."
  pnpm changeset version
fi

# Step 5: Build again after versioning (in case version changed anything)
if [ "$VERSION_TYPE" != "skip" ] || [ "$EXISTING_CHANGESETS" -gt 0 ]; then
  echo ""
  echo "📦 Rebuilding @codebolt/codeboltjs after versioning..."
  pnpm --filter @codebolt/codeboltjs run build
fi

# Step 6: Publish only @codebolt/codeboltjs
echo ""
echo "📤 Publishing @codebolt/codeboltjs to npm..."
pnpm publish --filter @codebolt/codeboltjs --no-git-checks

echo ""
echo "✅ Successfully published @codebolt/codeboltjs to npm!"

# Step 7: Clean up the changeset file (optional)
if [ "$VERSION_TYPE" != "skip" ] && [ -n "$CHANGESET_FILE" ] && [ -t 0 ]; then
  read -p "🗑️  Delete the changeset file? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm "$CHANGESET_FILE"
    echo "✅ Changeset file deleted"
  fi
fi

echo ""
echo "🎉 Done! Don't forget to commit and push the version changes:"
echo "   git add ."
echo "   git commit -m 'chore: publish @codebolt/codeboltjs'"
echo "   git push && git push --tags"

