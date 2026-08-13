#!/usr/bin/env node
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { buildMiniAppArchive, mediaTypeForPath, parseMiniAppArchive } from "../../miniapp-format/src/index.mjs";

function usage() {
  return `Standalone MiniApp CLI

  miniapp pack <app-directory> --output <file.miniapp>
  miniapp inspect <file.miniapp>
  miniapp verify <file.miniapp>
  miniapp upload <file.miniapp> --server <url> [--token <token>]
`;
}

function option(args, name) {
  const index = args.indexOf(name);
  if (index === -1) return undefined;
  const value = args[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${name} requires a value.`);
  args.splice(index, 2);
  return value;
}

async function filesBelow(root, directory) {
  const absolute = resolve(root, directory);
  try {
    const entries = await readdir(absolute, { withFileTypes: true });
    const files = [];
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const path = resolve(absolute, entry.name);
      if (entry.isDirectory()) files.push(...await filesBelow(root, relative(root, path)));
      else if (entry.isFile()) files.push(path);
    }
    return files;
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
}

async function buildFromDirectory(appDirectory) {
  const root = resolve(appDirectory);
  const manifest = JSON.parse(await readFile(resolve(root, "miniapp.json"), "utf8"));
  const paths = [...await filesBelow(root, "modules"), ...await filesBelow(root, "public")];
  const sourcePaths = manifest.source?.include ? await filesBelow(root, "source") : [];
  const files = await Promise.all([...paths, ...sourcePaths].map(async (path) => {
    const packagePath = relative(root, path).replaceAll("\\", "/");
    const kind = packagePath.startsWith("modules/") ? "module" : packagePath.startsWith("public/") ? "asset" : "source";
    return { path: packagePath, kind, mediaType: mediaTypeForPath(packagePath), data: await readFile(path) };
  }));
  return buildMiniAppArchive({ manifest, files });
}

async function pack(args) {
  const output = option(args, "--output");
  const appDirectory = args.shift();
  if (!appDirectory || !output || args.length) throw new Error("pack requires an app directory and --output.");
  const archive = await buildFromDirectory(appDirectory);
  const destination = resolve(output);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, archive);
  const parsed = await parseMiniAppArchive(archive);
  console.log(JSON.stringify({ success: true, output: destination, packageId: parsed.packageId, bytes: parsed.byteLength, files: parsed.files.size }, null, 2));
}

async function readPackage(path) {
  return parseMiniAppArchive(await readFile(resolve(path)));
}

function summary(parsed) {
  return {
    packageId: parsed.packageId,
    bytes: parsed.byteLength,
    manifest: parsed.manifest,
    files: [...parsed.files.values()].map(({ data: _data, ...entry }) => entry),
  };
}

async function inspect(args) {
  const path = args.shift();
  if (!path || args.length) throw new Error("inspect requires one .miniapp path.");
  console.log(JSON.stringify(summary(await readPackage(path)), null, 2));
}

async function verify(args) {
  const path = args.shift();
  if (!path || args.length) throw new Error("verify requires one .miniapp path.");
  const parsed = await readPackage(path);
  console.log(JSON.stringify({ success: true, packageId: parsed.packageId, files: parsed.files.size }, null, 2));
}

async function upload(args) {
  const server = option(args, "--server");
  const token = option(args, "--token") || process.env.MINIAPP_SERVER_TOKEN;
  const path = args.shift();
  if (!path || !server || args.length) throw new Error("upload requires a .miniapp path and --server.");
  const archive = await readFile(resolve(path));
  await parseMiniAppArchive(archive);
  const response = await fetch(`${server.replace(/\/$/, "")}/api/packages`, {
    method: "POST",
    headers: { "content-type": "application/vnd.codebolt.miniapp", ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: archive,
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`Upload failed (${response.status}): ${body}`);
  console.log(body);
}

const [command, ...args] = process.argv.slice(2);
try {
  if (command === "pack") await pack(args);
  else if (command === "inspect") await inspect(args);
  else if (command === "verify") await verify(args);
  else {
    console.log(usage());
    if (command && !["help", "--help", "-h"].includes(command)) process.exitCode = 2;
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
