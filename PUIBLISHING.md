# Publishing Packages

## Prerequisites

- `pnpm` and `@changesets/cli` installed (run `pnpm install` in the repo)
- Logged into npm with credentials that have publish rights for all packages (`pnpm npm login`)

# Creating New Project
By Default Any new Project in this monorepo should be:
 - Added in the workspace
 - Added To ignore in changeset config (unless you know what you are doing)
 - Must have private:true

## Publishable Packages

The following packages are configured for publishing:

| Package | Description | Dependencies |
|---------|-------------|--------------|
| `@codebolt/types` | Type definitions (foundational) | None |
| `@codebolt/codeboltjs` | Core CodeBolt JS library | types |
| `@codebolt/agent` | Main agent package | types, codeboltjs |
| `@codebolt/utils` | Utility functions | codeboltjs |
| `epoml` | EPOML parser | codeboltjs |
| `@codebolt/provider` | Provider base package | types, codeboltjs |
| `@codebolt/agentfs-provider` | AgentFS provider | codeboltjs, provider, types |
| `@codebolt/git-worktree-production` | Git worktree provider | codeboltjs, provider, types |
| `@codebolt/codeparser` | Code parser | None |
| `@codebolt/mcp` | MCP package | None |
| `@codebolt/litegraph` | Graph editor library | None |
| `@codebolt/agent-shared-nodes` | Shared node definitions | litegraph |

### Linked Package Groups

These packages are linked together (version bumps are synchronized):
- **Core SDK**: `@codebolt/codeboltjs`, `@codebolt/utils`, `@codebolt/agent`, `epoml`
- **Parser/MCP**: `@codebolt/codeparser`, `@codebolt/mcp`
- **Litegraph**: `@codebolt/litegraph`, `@codebolt/agent-shared-nodes`
- **Providers**: `@codebolt/provider`, `@codebolt/agentfs-provider`, `@codebolt/git-worktree-production`

### Foundational Package

- `@codebolt/types` - Used by most packages, not linked to allow independent versioning

### Automatic Dependency Updates

When a package with `workspace:*` dependencies is published:
1. `pnpm publish` automatically resolves `workspace:*` to actual versions
2. If `@codebolt/litegraph` changes, `@codebolt/agent-shared-nodes` will also get a patch bump (via `updateInternalDependencies: "patch"`)

## Workflow

1. **Create a changeset**
   - `pnpm changeset add`
   - Select the packages you changed and add a short summary.
   - Dependent packages will be automatically included if their dependencies changed.

2. **Version packages**
   - `pnpm changeset version`
   - This bumps versions and updates CHANGELOG files.
   - **Important**: This also updates any packages that depend on changed packages.
   - Commit the updated package versions, changelogs, and lockfile.

3. **Build and verify** (recommended)
   - `pnpm run build` (builds all packages)
   - Or filter: `pnpm --filter @codebolt/litegraph run build`
   - Optional: `pnpm pack --filter <package>` and inspect the generated `package.json` to verify `workspace:*` is resolved.

4. **Dry run to preview what will be published**
   - `pnpm changeset publish --dry-run`
   - This shows exactly which packages would be published without actually publishing
   - Look for lines like:
     - `🦋  info <package> is being published because our local version (x.x.x) has not been published on npm`
     - `🦋  warn <package> is not being published because version x.x.x is already published on npm`
   - **Important**: `changeset publish` publishes ANY package where local version ≠ npm version, not just packages added via `changeset add`
   - To prevent a package from being published, add `"private": true` to its package.json

5. **Publish**
   - Ensure you have publish permissions for every package included in the changeset.
   - `pnpm changeset publish`
   - **Important**: Always use `pnpm changeset publish` (not `npm publish`) to ensure `workspace:*` is resolved.
   - If npm reports `E403` for packages outside your control, remove them from the changeset or obtain access before retrying.

6. **Post-publish**
   - `git push && git push --tags`
   - Keep npm logs (`~/.npm/_logs/*.log`) for auditing any failures.

## Quick Publish Scripts

For convenience, use these scripts:

```bash
# Publish @codebolt/codeboltjs only
pnpm run publish:codeboltjs

# Publish without version bump
pnpm run publish:codeboltjs:skip
```

## Selective Publishing (Publish Specific Packages Only)

When you want to publish only certain packages (e.g., `codeboltjs` and `provider` but NOT `agent`):

**Why not `changeset publish`?** - It publishes ALL packages with version mismatches, not just the ones you want.

### Recommended: Use `pnpm publish --filter`

```bash
# First, build
pnpm run build

# Dry run to verify (shows what would be published without actually publishing)
pnpm --filter @codebolt/codeboltjs publish --dry-run --access public
pnpm --filter @codebolt/provider publish --dry-run --access public

# Then publish
pnpm --filter @codebolt/codeboltjs publish --access public
pnpm --filter @codebolt/provider publish --access public
```

### Alternative: Use `pnpm pack` + `npm publish`

Use this method if `pnpm publish --filter` has issues with `workspace:*` conversion:

#### Steps for selective publishing:

```bash
# 1. Build the packages first
pnpm run build

# 2. Navigate to the package directory and pack (converts workspace:* to real versions)
cd packages/codeboltjs
pnpm pack

# 3. Verify the tarball has correct dependencies (no workspace:*)
tar -tzf codebolt-codeboltjs-*.tgz | head -5
tar -xzf codebolt-codeboltjs-*.tgz -O package/package.json | grep -A 10 '"dependencies"'

# 4. Publish the tarball
npm publish codebolt-codeboltjs-*.tgz --access public

# 5. Clean up
rm -f codebolt-codeboltjs-*.tgz

# 6. Repeat for other packages you want to publish
cd ../provider
pnpm pack
npm publish codebolt-provider-*.tgz --access public
rm -f codebolt-provider-*.tgz
```

### Quick selective publish script:

```bash
# Function to selectively publish a package
publish_package() {
  local pkg_path=$1
  local pkg_name=$(basename $pkg_path)

  echo "Publishing $pkg_name..."
  cd $pkg_path
  pnpm pack
  npm publish *.tgz --access public
  rm -f *.tgz
  cd -
}

# Example: Publish only codeboltjs and provider
publish_package packages/codeboltjs
publish_package packages/provider
```

## How changeset publish works

**Important**: `changeset publish` does NOT only publish packages that were added via `changeset add`. It publishes ANY package where:
1. The package is NOT marked as `"private": true` in package.json
2. The local version does NOT exist on npm

This means if you have a package with version `1.0.0` locally and npm doesn't have that version, it will try to publish it regardless of whether you ran `changeset add` for it.

### Preventing unwanted publishing

To prevent a package from being published:
1. **Add `"private": true`** to the package.json (recommended - this is the ONLY reliable way)
2. **Add to ignore list** in `.changeset/config.json` - **WARNING**: This only prevents version bumping during `changeset version`, it does NOT prevent `changeset publish` from publishing the package if its version doesn't exist on npm!

## Notes

- **Workspace protocol resolution**: `workspace:*` ranges are automatically replaced with real versions when using `pnpm publish` or `pnpm changeset publish`.
- **Dependency cascade**: When `@codebolt/litegraph` is updated, `@codebolt/agent-shared-nodes` will automatically get a patch bump because it depends on litegraph.
- The `pnpm pack` check ensures the tarball's manifest contains resolved semver ranges before publishing.
- Private packages are excluded from publishing:
  - `@agent-creator/frontend`, `@agent-creator/backend`, `@agent-creator/agent`
  - `dockerprovideragent`, `remoteserverprovideragent`
  - `@codebolt/git-worktree-provider`
  - `@codebolt/create-team-for-swarm`, `@codebolt/find-next-job-for-agent`
  - Plugin templates: `@codebolt/plugin-template`, `@codebolt/plugin-and-logic`, `@codebolt/plugin-enhanced-math`, `@codebolt/plugin-text-processor`
