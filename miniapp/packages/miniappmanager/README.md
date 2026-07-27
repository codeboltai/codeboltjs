# @codebolt/miniappmanager

Deprecated: this package was a deployment POC that called provider APIs with
developer-supplied provider tokens. New MiniApp deployments should use
`codebolt miniapp deploy`, which sends the built MiniApp manifest to CodeBolt
cloud through Edge API so provider credentials remain server-side.

CLI for building and deploying CodeBolt MiniApps to provider APIs without requiring Git-based deploys.

```powershell
codebolt-miniapp deploy examples/lead-react --target vercel --dry-run
codebolt-miniapp deploy examples/lead-react --target deno --deno-token ddo_...
codebolt-miniapp deploy examples/leads --target netlify --netlify-token nfp_...
```

## Credentials

Credentials can be passed as CLI flags, environment variables, or a `.env` file. CLI flags take precedence over environment variables, and real environment variables take precedence over `.env` values.

| Target | CLI flags | Environment |
| --- | --- | --- |
| Vercel | `--token`, `--vercel-token`, optional `--team-id`, optional `--project` override | `VERCEL_TOKEN`, optional `VERCEL_TEAM_ID`, `VERCEL_ORG_ID`, optional `VERCEL_PROJECT`, `VERCEL_PROJECT_ID` override |
| Netlify | `--token`, `--netlify-token`, `--site-id`, `--site-name`, `--account-slug` | `NETLIFY_AUTH_TOKEN`, `NETLIFY_TOKEN`, `NETLIFY_SITE_ID`, `NETLIFY_SITE_NAME`, `NETLIFY_ACCOUNT_SLUG` |
| Deno | `--token`, `--deno-token`, optional `--app` override | `DENO_DEPLOY_TOKEN`, `DENO_TOKEN`, optional `DENO_APP`, `DENO_APP_ID`, `DENO_APP_SLUG` override |

By default the CLI loads `.env` from the current working directory. Use `--env-file <file>` to load another file.

```dotenv
VERCEL_TOKEN=
# Optional Vercel overrides.
# VERCEL_TEAM_ID=
# VERCEL_PROJECT=

NETLIFY_AUTH_TOKEN=

# Optional Netlify overrides.
# NETLIFY_SITE_ID=
# NETLIFY_SITE_NAME=
# NETLIFY_ACCOUNT_SLUG=

DENO_DEPLOY_TOKEN=
# Optional Deno app override. Defaults to codeboltMiniApp({ id }).
# DENO_APP=
```

## Deploy

```powershell
codebolt-miniapp deploy <miniapp-root> --target <vercel|netlify|deno>
```

By default the command runs `nitro build` with the matching preset:

| Target | Nitro preset | Expected output |
| --- | --- | --- |
| `vercel` | `vercel` | `.vercel/output` |
| `netlify` | `netlify` | `dist` and `.netlify/functions-internal` |
| `deno` | `deno-deploy` | `.output` |

Use `--skip-build` to deploy an existing output directory, and `--output-dir` to point at a custom output.

Use `--dry-run` first. It prints the resolved credential sources, output path, file count, byte count, and provider payload shape without calling any provider API.

## Current Notes

Vercel and Deno adapters upload generated files directly to their deployment APIs.

For Vercel, the manager reads the generated `codebolt/miniapp.manifest.json`
and uses its `id` as the deployment/project name. Vercel can create the project
from the deployment request. Use `--project` only to target an existing Vercel
project, and `--team-id` only when deploying into a team instead of the token's
personal scope.

For Deno, the manager reads the generated `codebolt/miniapp.manifest.json` and
uses its `id` as the app slug. If the app already exists, it is reused. If it is
missing, the manager creates it with the runtime entrypoint from the Nitro output
and then deploys the revision. Use `--app` only to override the slug.

Netlify deploys use the file digest API for static files and the functions digest API for Nitro's generated `.netlify/functions-internal` server function. The manager packages Nitro's function directory as a ZIP, uploads required functions, then polls the deploy until Netlify reports a terminal state.

For Netlify, `--site-id` means deploy to an existing site. If it is omitted, the manager creates a new site first. The default site name comes from the generated `codebolt/miniapp.manifest.json` `id`, which is produced from `codeboltMiniApp({ id })` in `nitro.config.ts`. Use `--site-name` only to override that name, and `--account-slug` only when the new site should be created under a specific Netlify team.
