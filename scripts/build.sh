#!/bin/bash
# Build script for codeboltjs monorepo
# Usage:
#   ./scripts/build.sh              # Build core packages only (packages/*, common/*)
#   ./scripts/build.sh all          # Build everything (same as pnpm run build)
#   ./scripts/build.sh agents       # Build core + agents
#   ./scripts/build.sh providers    # Build core + providers
#   ./scripts/build.sh actions      # Build core + action-blocks
#   ./scripts/build.sh plugins      # Build agentcreator plugins
#   ./scripts/build.sh <name>       # Build a specific package by name (e.g. @codebolt/agent)

set -e

GROUP="${1:-core}"

echo "==> Building group: $GROUP"

case "$GROUP" in
  core)
    echo "==> Building core packages (packages/*)"
    pnpm turbo run build --filter='./packages/*'
    ;;
  agents)
    echo "==> Building core + agents"
    pnpm turbo run build --filter='./packages/*' --filter='./agents/*'
    ;;
  providers)
    echo "==> Building core + providers"
    pnpm turbo run build --filter='./packages/*' --filter='./providers/*'
    ;;
  actions)
    echo "==> Building core + action-blocks"
    pnpm turbo run build --filter='./packages/*' --filter='./action-blocks/*'
    ;;
  plugins)
    echo "==> Building agentcreator plugins"
    pnpm turbo run build --filter='./agentcreator/*' --filter='./agentcreator/customnodes/*'
    ;;
  main)
    echo "==> Building main packages"
    pnpm turbo run build --filter='./packages/*' --filter='./remoteexecutor/*' --filter='./agentcreator/*' --filter='./documentation/*' --filter='./cli/*' --filter='./multillm-node/*'
    ;;
  remote)
    echo "==> Building core + remote packages"
    pnpm turbo run build --filter='./packages/*' --filter='./remoteexecutor/*' --filter='./remoteenvironments/*'
    ;;
  all)
    echo "==> Building ALL packages"
    pnpm turbo run build
    ;;
  *)
    echo "==> Building specific package: $GROUP (with dependencies)"
    pnpm turbo run build --filter="$GROUP..."
    ;;
esac

echo "==> Build complete!"
