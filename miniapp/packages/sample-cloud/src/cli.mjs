#!/usr/bin/env node
import { createSampleCloudServer } from "./index.mjs";

function usage() {
  return [
    "Usage:",
    "  codebolt-sample-cloud [--port <port>] [--host <host>]",
    "",
    "Endpoints:",
    "  GET  /health",
    "  POST /token",
    "  POST /capabilities/:name",
  ].join("\n");
}

function readValue(args, index, flag) {
  const value = args[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${flag} requires a value.`);
  return value;
}

function parseArgs(args) {
  const options = {
    port: Number(process.env.PORT) || 4590,
    host: process.env.HOST || "127.0.0.1",
  };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--help" || arg === "-h") return { help: true };
    if (arg === "--port" || arg === "-p") {
      options.port = Number(readValue(args, index, arg));
      index += 1;
      continue;
    }
    if (arg === "--host") {
      options.host = readValue(args, index, arg);
      index += 1;
      continue;
    }
    throw new Error(`Unknown option: ${arg}`);
  }
  if (!Number.isInteger(options.port) || options.port < 0) {
    throw new Error("--port must be a non-negative integer.");
  }
  return options;
}

let cloud;
try {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    process.exit(0);
  }
  cloud = createSampleCloudServer();
  const url = await cloud.listen(options);
  console.log(`Sample CodeBolt Cloud listening at ${url}`);
  console.log(`Use CODEBOLT_CLOUD_URL=${url}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  console.error("");
  console.error(usage());
  process.exit(1);
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, async () => {
    await cloud?.close();
    process.exit(0);
  });
}
