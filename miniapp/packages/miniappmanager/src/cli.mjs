#!/usr/bin/env node
import { resolve } from "node:path";
import { deployMiniApp, supportedTargets } from "./index.mjs";

function usage() {
  return [
    "Usage:",
    "  codebolt-miniapp deploy <miniapp-root> --target <target> [options]",
    "",
    "Targets:",
    `  ${supportedTargets().join(", ")}`,
    "",
    "Credential options:",
    "  --token <token>             Generic provider token",
    "  --vercel-token <token>      Or VERCEL_TOKEN",
    "  --netlify-token <token>     Or NETLIFY_AUTH_TOKEN / NETLIFY_TOKEN",
    "  --deno-token <token>        Or DENO_DEPLOY_TOKEN / DENO_TOKEN",
    "  --site-id <id>              Optional: reuse an existing Netlify site",
    "  --site-name <name>          Optional: override Netlify name; defaults to MiniApp id",
    "  --account-slug <slug>       Optional: create new Netlify site under this team",
    "  --app <slug-or-id>          Deno app slug/id, or DENO_APP / DENO_APP_ID / DENO_APP_SLUG",
    "  --team-id <id>              Vercel team id, or VERCEL_TEAM_ID / VERCEL_ORG_ID",
    "  --project <name-or-id>      Vercel project name/id, or VERCEL_PROJECT / VERCEL_PROJECT_ID",
    "",
    "Deploy options:",
    "  --prod                      Deploy to production when provider supports it",
    "  --dry-run                   Build and print the deploy plan without API calls",
    "  --skip-build                Use existing provider output",
    "  --output-dir <dir>          Use an explicit output directory",
    "  --env-file <file>           Load provider values from a .env file",
    "  --title <title>             Provider deploy title where supported",
    "  --help, -h                  Show this help",
    "",
    "Examples:",
    "  codebolt-miniapp deploy examples/lead-react --target vercel --dry-run",
    "  codebolt-miniapp deploy examples/leads --target netlify --token nfp_...",
    "  codebolt-miniapp deploy examples/leads --target deno --app leads --deno-token ddo_...",
  ].join("\n");
}

function readValue(args, index, flag) {
  const value = args[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`${flag} requires a value.`);
  }
  return value;
}

function parseArgs(args) {
  if (!args.length || args.includes("--help") || args.includes("-h")) {
    return { help: true };
  }

  const command = args[0];
  if (command !== "deploy") {
    throw new Error(`Unknown command: ${command}`);
  }

  const options = {};
  const positional = [];
  for (let index = 1; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--target") {
      options.target = readValue(args, index, arg);
      index += 1;
      continue;
    }
    if (arg === "--token") {
      options.token = readValue(args, index, arg);
      index += 1;
      continue;
    }
    if (arg === "--vercel-token") {
      options.vercelToken = readValue(args, index, arg);
      index += 1;
      continue;
    }
    if (arg === "--netlify-token") {
      options.netlifyToken = readValue(args, index, arg);
      index += 1;
      continue;
    }
    if (arg === "--deno-token") {
      options.denoToken = readValue(args, index, arg);
      index += 1;
      continue;
    }
    if (arg === "--site-id") {
      options.siteId = readValue(args, index, arg);
      index += 1;
      continue;
    }
    if (arg === "--site-name") {
      options.siteName = readValue(args, index, arg);
      index += 1;
      continue;
    }
    if (arg === "--account-slug") {
      options.accountSlug = readValue(args, index, arg);
      index += 1;
      continue;
    }
    if (arg === "--app") {
      options.app = readValue(args, index, arg);
      index += 1;
      continue;
    }
    if (arg === "--team-id") {
      options.teamId = readValue(args, index, arg);
      index += 1;
      continue;
    }
    if (arg === "--project") {
      options.project = readValue(args, index, arg);
      index += 1;
      continue;
    }
    if (arg === "--output-dir") {
      options.outputDir = resolve(readValue(args, index, arg));
      index += 1;
      continue;
    }
    if (arg === "--env-file") {
      options.envFile = resolve(readValue(args, index, arg));
      index += 1;
      continue;
    }
    if (arg === "--title") {
      options.title = readValue(args, index, arg);
      index += 1;
      continue;
    }
    if (arg === "--prod" || arg === "--production") {
      options.production = true;
      continue;
    }
    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }
    if (arg === "--skip-build") {
      options.skipBuild = true;
      continue;
    }
    if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    }
    positional.push(arg);
  }

  if (positional.length !== 1) {
    throw new Error("Pass exactly one MiniApp root.");
  }
  if (!options.target) {
    throw new Error("--target is required.");
  }

  options.appRoot = resolve(positional[0]);
  return options;
}

try {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    process.exit(0);
  }

  const result = await deployMiniApp(options);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  console.error("");
  console.error(usage());
  process.exit(1);
}
