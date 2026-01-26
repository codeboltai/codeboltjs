# Publishing Packages

## Prerequisites

- `pnpm` and `@changesets/cli` installed (run `pnpm install` in the repo)
- Logged into npm with credentials that have publish rights for all packages (`pnpm npm login`)

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

4. **Publish**
   - Ensure you have publish permissions for every package included in the changeset.
   - `pnpm changeset publish`
   - **Important**: Always use `pnpm changeset publish` (not `npm publish`) to ensure `workspace:*` is resolved.
   - If npm reports `E403` for packages outside your control, remove them from the changeset or obtain access before retrying.

5. **Post-publish**
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
