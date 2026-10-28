#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { buildNitroMiniAppArchive, parseMiniAppArchive } from "./bundle.mjs";

function option(args, name) {
  const index = args.indexOf(name);
  if (index === -1) return undefined;
  const value = args[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${name} requires a value.`);
  args.splice(index, 2);
  return value;
}

async function main() {
  const args = process.argv.slice(2);
  const command = args.shift();
  if (command === "pack") {
    const output = option(args, "--output");
    const outputDir = args.shift();
    if (!outputDir || !output || args.length) throw new Error("Usage: codebolt-miniapp-bundle pack <nitro-output-directory> --output <file.miniapp>");
    const result = await buildNitroMiniAppArchive({ outputDir });
    const destination = resolve(output);
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, result.archive);
    const parsed = await parseMiniAppArchive(result.archive);
    console.log(JSON.stringify({ success: true, output: destination, packageId: parsed.packageId, manifest: parsed.manifest, bytes: parsed.byteLength, modules: result.moduleCount, assets: result.assetCount }));
    return;
  }
  if (command === "inspect" || command === "verify") {
    const file = args.shift();
    if (!file || args.length) throw new Error(`Usage: codebolt-miniapp-bundle ${command} <file.miniapp>`);
    const parsed = await parseMiniAppArchive(await readFile(resolve(file)));
    console.log(JSON.stringify({ success: true, packageId: parsed.packageId, manifest: parsed.manifest, bytes: parsed.byteLength, files: parsed.files.size }, null, command === "inspect" ? 2 : 0));
    return;
  }
  throw new Error("Usage: codebolt-miniapp-bundle <pack|inspect|verify>");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
