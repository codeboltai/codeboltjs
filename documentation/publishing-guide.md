# Publishing `@codebolt/agent`

## Prerequisites

- `pnpm` and `@changesets/cli` installed (run `pnpm install` in the repo)
- Logged into npm with credentials that have publish rights for all packages (`pnpm npm login`)

## Workflow

1. **Create a changeset**
   - `pnpm changeset add`
   - Select `@codebolt/agent` (and any other packages) and add a short summary.

2. **Version packages**
   - `pnpm changeset version`
   - Commit the updated package versions, changelogs, and lockfile.

3. **Build and verify** (recommended)
   - `pnpm --filter @codebolt/agent run build`
   - Optional: `pnpm pack --filter @codebolt/agent` and inspect the generated `package.json`.

4. **Publish**
   - Ensure you have publish permissions for every package included in the changeset.
   - `pnpm changeset publish`
   - If npm reports `E403` for packages outside your control, remove them from the changeset or obtain access before retrying.

5. **Post-publish**
   - `git push && git push --tags`
   - Keep npm logs (`~/.npm/_logs/*.log`) for auditing any failures.

## Notes

- Workspace protocol ranges (`workspace:*`) are replaced with real versions during `changeset version`.
- The `pnpm pack` check ensures the tarball’s manifest contains resolved semver ranges before publishing.
