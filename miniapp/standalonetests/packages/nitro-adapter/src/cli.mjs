#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { parseMiniAppArchive } from "../../miniapp-format/src/index.mjs";
import { buildNitroMiniAppArchive } from "./index.mjs";

function option(args, name) {
  const index = args.indexOf(name);
  if (index === -1) return undefined;
  const value = args[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${name} requires a value.`);
  args.splice(index, 2);
  return value;
}

const args = process.argv.slice(2);
const command = args.shift();
try {
  if (command !== "pack") throw new Error("Usage: nitro-miniapp pack <nitro-output-directory> --output <file.miniapp>");
  const output = option(args, "--output");
  const outputDir = args.shift();
  if (!outputDir || !output || args.length) throw new Error("pack requires a Nitro output directory and --output.");
  const result = await buildNitroMiniAppArchive({ outputDir });
  const destination = resolve(output);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, result.archive);
  const parsed = await parseMiniAppArchive(result.archive);
  console.log(JSON.stringify({ success: true, output: destination, packageId: parsed.packageId, bytes: parsed.byteLength, modules: result.moduleCount, assets: result.assetCount }, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
