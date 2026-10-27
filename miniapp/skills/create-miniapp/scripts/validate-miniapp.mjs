#!/usr/bin/env node
import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { basename, extname, join, resolve } from "node:path";

const args = process.argv.slice(2);
const json = args.includes("--json");
const requireBuild = args.includes("--require-build");
const positional = args.filter((arg) => !arg.startsWith("--"));
const root = resolve(positional[0] || process.cwd());
const errors = [];
const warnings = [];
const checks = [];

function pass(message) { checks.push(message); }
function fail(message) { errors.push(message); }
function warn(message) { warnings.push(message); }

async function text(path) {
  return readFile(path, "utf8");
}

async function files(directory) {
  if (!existsSync(directory)) return [];
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  }));
  return nested.flat().sort();
}

function validateManifest(manifest, path) {
  if (!manifest || typeof manifest !== "object") return fail(`${path} is not an object.`);
  if (!/^[a-z0-9-]+$/.test(manifest.id || "")) fail(`${path}: id must match [a-z0-9-]+.`);
  if (!manifest.title) fail(`${path}: title is required.`);
  if (!manifest.version) fail(`${path}: version is required.`);
  if (!manifest.ui?.route) fail(`${path}: ui.route is required.`);
  if (!manifest.runtime?.handler && manifest.format !== "codebolt.miniapp.v1") fail(`${path}: runtime.handler is required.`);
  const tools = Array.isArray(manifest.tools) ? manifest.tools : [];
  const names = tools.map((tool) => tool?.name).filter(Boolean);
  if (new Set(names).size !== names.length) fail(`${path}: duplicate tool names found.`);
  for (const tool of tools) {
    if (!tool.inputSchema || typeof tool.inputSchema !== "object") fail(`${path}: tool ${tool.name || "<unknown>"} has no inputSchema.`);
  }
  pass(`validated manifest ${path}`);
}

if (!existsSync(root)) fail(`MiniApp root does not exist: ${root}`);

const packagePath = join(root, "package.json");
if (!existsSync(packagePath)) {
  fail("package.json is required.");
} else {
  try {
    const packageJson = JSON.parse(await text(packagePath));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    if (!dependencies["@codebolt/miniapp"]) fail("Install @codebolt/miniapp.");
    if (!dependencies.nitro) fail("Install nitro.");
    if (!packageJson.scripts?.build) warn("Add a build script.");
    pass("validated package.json");
  } catch (error) {
    fail(`package.json is invalid JSON: ${error.message}`);
  }
}

const configNames = ["nitro.config.ts", "nitro.config.js", "nitro.config.mjs", "nitro.config.mts"];
const configPath = configNames.map((name) => join(root, name)).find(existsSync);
if (!configPath) {
  fail("A nitro.config.ts/js/mjs/mts file is required.");
} else {
  const config = await text(configPath);
  if (!config.includes("codeboltMiniApp")) fail(`${basename(configPath)} must use codeboltMiniApp().`);
  if (!config.includes("resolveTarget")) warn(`${basename(configPath)} should compose resolveTarget().`);
  const id = config.match(/\bid\s*:\s*["']([^"']+)["']/)?.[1];
  if (!id) fail(`${basename(configPath)} must declare a literal MiniApp id.`);
  else if (!/^[a-z0-9-]+$/.test(id)) fail(`MiniApp id '${id}' must match [a-z0-9-]+.`);
  if (!/\btitle\s*:/.test(config)) fail(`${basename(configPath)} must declare title.`);
  pass(`validated ${basename(configPath)}`);
}

const sourceFiles = (await files(join(root, "server"))).filter((path) => /\.[cm]?[jt]s$/.test(path));
const publicFiles = await files(join(root, "public"));
if (!sourceFiles.length) warn("No server source files found.");
if (!publicFiles.length) warn("No public UI assets found.");

const toolSegment = join("server", "tools");
const collectionSegment = join("server", "collections");
const apiSegment = join("server", "api");
const definitions = sourceFiles.filter((path) => path.includes(toolSegment) || path.includes(collectionSegment));
for (const path of definitions) {
  const source = await text(path);
  if (!source.includes("export default")) fail(`${path}: definition must be a default export.`);
  if (path.includes(toolSegment) && !source.includes("defineTool")) fail(`${path}: tool file must use defineTool().`);
  if (path.includes(collectionSegment) && !source.includes("defineCollection")) fail(`${path}: collection file must use defineCollection().`);
}

for (const path of sourceFiles) {
  const source = await text(path);
  if (/\beval\s*\(|\bnew\s+Function\s*\(/.test(source)) fail(`${path}: dynamic code generation is not Worker-safe.`);
  if (/from\s+["'](?:node:)?fs(?:\/[^"']*)?["']/.test(source)) fail(`${path}: filesystem imports are not Worker-safe.`);
  if (/\bcreateServer\s*\(/.test(source)) warn(`${path}: do not start an HTTP server inside a MiniApp.`);
  if (path.includes(apiSegment) && source.includes("useMiniApp()")) fail(`${path}: pass the Nitro event to useMiniApp(event).`);
}

for (const path of publicFiles.filter((path) => [".html", ".js", ".mjs", ".css"].includes(extname(path)))) {
  const source = await text(path);
  if (/https?:\/\/(?:localhost|127\.0\.0\.1|[^\s"']+\.workers\.dev|[^\s"']+\.codebolt\.app)/i.test(source)) fail(`${path}: browser code must use relative MiniApp URLs.`);
  if (source.includes("/__codebolt/tools")) fail(`${path}: browser UI must call app APIs, not tool control routes.`);
}

const manifestCandidates = [
  join(root, ".output", "codebolt", "miniapp.manifest.json"),
  join(root, ".output-cloudflare", "codebolt", "miniapp.manifest.json"),
];
const manifests = manifestCandidates.filter(existsSync);
if (requireBuild && !manifests.length) fail("No built MiniApp manifest found; run the project build first.");
if (!manifests.length) warn("No build manifest found; source-only validation completed.");
for (const path of manifests) {
  try { validateManifest(JSON.parse(await text(path)), path); }
  catch (error) { fail(`${path} is invalid JSON: ${error.message}`); }
}

const result = { success: errors.length === 0, root, checks, warnings, errors };
if (json) {
  console.log(JSON.stringify(result, null, 2));
} else {
  for (const item of checks) console.log(`PASS ${item}`);
  for (const item of warnings) console.warn(`WARN ${item}`);
  for (const item of errors) console.error(`FAIL ${item}`);
  console.log(`${result.success ? "VALID" : "INVALID"}: ${root}`);
}
if (!result.success) process.exitCode = 1;
