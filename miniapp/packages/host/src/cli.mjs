#!/usr/bin/env node
import { resolve } from "node:path";
import { createMiniAppHost } from "./index.mjs";

function usage() {
  return [
    "Usage:",
    "  codebolt-miniapp-host --dir <miniapp-dir> [--port <port>] [--data-dir <dir>] [--idle-ms <ms>]",
    "  codebolt-miniapp-host <app-root...> [--port <port>] [--data-dir <dir>] [--idle-ms <ms>]",
    "",
    "Examples:",
    "  codebolt-miniapp-host --dir examples",
    "  codebolt-miniapp-host examples/leads examples/lead-react",
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
  const options = {
    port: Number(process.env.PORT) || 4310,
    appRoots: [],
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--help" || arg === "-h") {
      return { help: true };
    }
    if (arg === "--dir" || arg === "-d") {
      options.miniappDir = resolve(readValue(args, index, arg));
      index += 1;
      continue;
    }
    if (arg === "--port" || arg === "-p") {
      options.port = Number(readValue(args, index, arg));
      index += 1;
      continue;
    }
    if (arg === "--data-dir") {
      options.dataDir = resolve(readValue(args, index, arg));
      index += 1;
      continue;
    }
    if (arg === "--idle-ms") {
      options.idleMs = Number(readValue(args, index, arg));
      index += 1;
      continue;
    }
    if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    }
    options.appRoots.push(resolve(arg));
  }

  if (!Number.isInteger(options.port) || options.port < 0) {
    throw new Error("--port must be a non-negative integer.");
  }
  if (options.idleMs !== undefined && (!Number.isInteger(options.idleMs) || options.idleMs < 0)) {
    throw new Error("--idle-ms must be a non-negative integer.");
  }
  if (options.miniappDir && options.appRoots.length) {
    throw new Error("Pass either --dir or app roots, not both.");
  }
  if (!options.miniappDir && !options.appRoots.length) {
    throw new Error("Pass --dir or at least one MiniApp root.");
  }

  if (!options.appRoots.length) delete options.appRoots;
  return options;
}

let host;
try {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    process.exit(0);
  }

  host = await createMiniAppHost(options);
  const urls = await host.listen();

  console.log(`MiniApp host listening on one port: ${urls.port}`);
  for (const [id, url] of Object.entries(urls.appUrls)) {
    console.log(`${id}: ${url}`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  console.error("");
  console.error(usage());
  process.exit(1);
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, async () => {
    await host?.close();
    process.exit(0);
  });
}
