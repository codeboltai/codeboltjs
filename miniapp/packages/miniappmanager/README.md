# @codebolt/miniappmanager

CLI for building and deploying CodeBolt MiniApps to provider APIs without requiring Git-based deploys.

```powershell
codebolt-miniapp deploy examples/lead-react --target vercel --dry-run
codebolt-miniapp deploy examples/leads --target deno --app leads --deno-token ddo_...
codebolt-miniapp deploy examples/leads --target netlify --netlify-token nfp_...
```

## Credentials

Credentials can be passed as CLI flags, environment variables, or a `.env` file. CLI flags take precedence over environment variables, and real environment variables take precedence over `.env` values.

| Target | CLI flags | Environment |
| --- | --- | --- |
| Vercel | `--token`, `--vercel-token`, `--team-id`, `--project` | `VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_ORG_ID`, `VERCEL_PROJECT`, `VERCEL_PROJECT_ID` |
| Netlify | `--token`, `--netlify-token`, `--site-id`, `--site-name`, `--account-slug` | `NETLIFY_AUTH_TOKEN`, `NETLIFY_TOKEN`, `NETLIFY_SITE_ID`, `NETLIFY_SITE_NAME`, `NETLIFY_ACCOUNT_SLUG` |
| Deno | `--token`, `--deno-token`, `--app` | `DENO_DEPLOY_TOKEN`, `DENO_TOKEN`, `DENO_APP`, `DENO_APP_ID`, `DENO_APP_SLUG` |

By default the CLI loads `.env` from the current working directory. Use `--env-file <file>` to load another file.

```dotenv
VERCEL_TOKEN=
VERCEL_PROJECT=
VERCEL_TEAM_ID=

NETLIFY_AUTH_TOKEN=

# Optional Netlify overrides.
# NETLIFY_SITE_ID=
# NETLIFY_SITE_NAME=
# NETLIFY_ACCOUNT_SLUG=

DENO_DEPLOY_TOKEN=
DENO_APP=
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

Netlify static file deploy is wired through the file digest API. Nitro server function bundle upload is detected but intentionally blocked until a Netlify function bundle packager is added.

For Netlify, `--site-id` means deploy to an existing site. If it is omitted, the manager creates a new site first. The default site name comes from the generated `codebolt/miniapp.manifest.json` `id`, which is produced from `codeboltMiniApp({ id })` in `nitro.config.ts`. Use `--site-name` only to override that name, and `--account-slug` only when the new site should be created under a specific Netlify team.
