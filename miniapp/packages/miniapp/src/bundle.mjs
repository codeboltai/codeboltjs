import { readFile, readdir } from "node:fs/promises";
import { relative, resolve } from "node:path";

const MAGIC = new Uint8Array([0x43, 0x42, 0x4d, 0x49, 0x4e, 0x49, 0x41, 0x50]);
const FORMAT_VERSION = 1;
const PREFIX_BYTES = 24;
const MAX_HEADER_BYTES = 1024 * 1024;
const MAX_CONTENT_BYTES = 32 * 1024 * 1024;
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const FILE_KINDS = new Set(["module", "asset", "source", "json", "text", "data", "wasm"]);
const encoder = new TextEncoder();
const decoder = new TextDecoder();

export class MiniAppBundleError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "MiniAppBundleError";
    this.code = code;
  }
}

function fail(code, message) {
  throw new MiniAppBundleError(code, message);
}

function bytes(value) {
  if (value instanceof Uint8Array) return value;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  if (typeof value === "string") return encoder.encode(value);
  fail("INVALID_FILE_DATA", "MiniApp file data must be bytes or a string.");
}

function normalizePath(value) {
  if (typeof value !== "string" || !value) fail("INVALID_PATH", "MiniApp file path is required.");
  const path = value.replaceAll("\\", "/");
  if (path.startsWith("/") || /^[a-zA-Z]:\//.test(path)) fail("INVALID_PATH", `Absolute MiniApp path is not allowed: ${value}`);
  const parts = path.split("/");
  if (parts.some((part) => !part || part === "." || part === "..")) fail("INVALID_PATH", `Unsafe MiniApp path: ${value}`);
  return parts.join("/");
}

function plainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function validateMiniAppBundleManifest(manifest) {
  if (!plainObject(manifest)) fail("INVALID_MANIFEST", "MiniApp manifest must be an object.");
  if (manifest.format !== "codebolt.miniapp.v1") fail("UNSUPPORTED_MANIFEST", "Manifest format must be codebolt.miniapp.v1.");
  for (const field of ["id", "title", "version"]) {
    if (typeof manifest[field] !== "string" || !manifest[field].trim()) fail("INVALID_MANIFEST", `Manifest ${field} must be a non-empty string.`);
  }
  if (!/^[a-zA-Z0-9._-]+$/.test(manifest.id)) fail("INVALID_MANIFEST", "Manifest id contains unsupported characters.");
  if (!plainObject(manifest.runtime) || manifest.runtime.protocol !== "codebolt.fetch.v1") fail("INVALID_MANIFEST", "Manifest runtime.protocol must be codebolt.fetch.v1.");
  manifest.runtime.mainModule = normalizePath(manifest.runtime.mainModule);
  if (typeof manifest.runtime.compatibilityDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(manifest.runtime.compatibilityDate)) fail("INVALID_MANIFEST", "Manifest runtime.compatibilityDate must use YYYY-MM-DD.");
  if (manifest.runtime.compatibilityFlags !== undefined && (!Array.isArray(manifest.runtime.compatibilityFlags) || manifest.runtime.compatibilityFlags.some((flag) => typeof flag !== "string"))) fail("INVALID_MANIFEST", "Manifest runtime.compatibilityFlags must be strings.");
  if (manifest.ui?.entry) manifest.ui.entry = normalizePath(manifest.ui.entry);
  return manifest;
}

export async function sha256Hex(value) {
  const digest = await crypto.subtle.digest("SHA-256", bytes(value));
  return [...new Uint8Array(digest)].map((part) => part.toString(16).padStart(2, "0")).join("");
}

export async function buildMiniAppArchive({ manifest: rawManifest, files: rawFiles }) {
  const manifest = validateMiniAppBundleManifest(structuredClone(rawManifest));
  if (!Array.isArray(rawFiles) || rawFiles.length === 0) fail("INVALID_FILES", "A MiniApp package must contain files.");
  const seen = new Set();
  const files = rawFiles.map((file) => {
    const path = normalizePath(file.path);
    if (seen.has(path)) fail("DUPLICATE_PATH", `Duplicate MiniApp file: ${path}`);
    seen.add(path);
    const data = bytes(file.data).slice();
    if (data.byteLength > MAX_FILE_BYTES) fail("FILE_TOO_LARGE", `MiniApp file is too large: ${path}`);
    const kind = file.kind ?? (path.startsWith("public/") ? "asset" : "module");
    if (!FILE_KINDS.has(kind)) fail("INVALID_FILE_KIND", `Unsupported MiniApp file kind: ${kind}`);
    return { path, kind, mediaType: file.mediaType || "application/octet-stream", data };
  }).sort((a, b) => a.path.localeCompare(b.path));
  if (!seen.has(manifest.runtime.mainModule)) fail("MAIN_MODULE_MISSING", `Main module is missing: ${manifest.runtime.mainModule}`);
  if (manifest.ui?.entry && !seen.has(manifest.ui.entry)) fail("UI_ENTRY_MISSING", `UI entry is missing: ${manifest.ui.entry}`);

  let offset = 0;
  const indexedFiles = [];
  for (const file of files) {
    indexedFiles.push({ path: file.path, kind: file.kind, mediaType: file.mediaType, offset, length: file.data.byteLength, sha256: await sha256Hex(file.data) });
    offset += file.data.byteLength;
  }
  if (offset > MAX_CONTENT_BYTES) fail("PACKAGE_TOO_LARGE", "MiniApp package content is too large.");
  const headerBytes = encoder.encode(JSON.stringify({ manifest, files: indexedFiles }));
  if (headerBytes.byteLength > MAX_HEADER_BYTES) fail("HEADER_TOO_LARGE", "MiniApp package header is too large.");
  const archive = new Uint8Array(PREFIX_BYTES + headerBytes.byteLength + offset);
  archive.set(MAGIC, 0);
  const view = new DataView(archive.buffer);
  view.setUint32(8, FORMAT_VERSION);
  view.setUint32(12, headerBytes.byteLength);
  view.setBigUint64(16, BigInt(offset));
  archive.set(headerBytes, PREFIX_BYTES);
  let contentOffset = PREFIX_BYTES + headerBytes.byteLength;
  for (const file of files) {
    archive.set(file.data, contentOffset);
    contentOffset += file.data.byteLength;
  }
  return archive;
}

export async function parseMiniAppArchive(value, { verify = true } = {}) {
  const archive = bytes(value);
  if (archive.byteLength < PREFIX_BYTES) fail("TRUNCATED_ARCHIVE", "MiniApp archive is too short.");
  if (!MAGIC.every((part, index) => archive[index] === part)) fail("INVALID_MAGIC", "File is not a MiniApp archive.");
  const view = new DataView(archive.buffer, archive.byteOffset, archive.byteLength);
  if (view.getUint32(8) !== FORMAT_VERSION) fail("UNSUPPORTED_VERSION", `Unsupported MiniApp archive version: ${view.getUint32(8)}`);
  const headerLength = view.getUint32(12);
  const contentLength = Number(view.getBigUint64(16));
  if (!Number.isSafeInteger(contentLength) || headerLength > MAX_HEADER_BYTES || contentLength > MAX_CONTENT_BYTES || PREFIX_BYTES + headerLength + contentLength !== archive.byteLength) fail("INVALID_LENGTH", "MiniApp archive lengths are invalid.");
  let header;
  try {
    header = JSON.parse(decoder.decode(archive.subarray(PREFIX_BYTES, PREFIX_BYTES + headerLength)));
  } catch {
    fail("INVALID_HEADER", "MiniApp archive header is not valid JSON.");
  }
  const manifest = validateMiniAppBundleManifest(header.manifest);
  if (!Array.isArray(header.files) || !header.files.length) fail("INVALID_HEADER", "MiniApp archive has no file index.");
  const contentStart = PREFIX_BYTES + headerLength;
  const files = new Map();
  let expectedOffset = 0;
  for (const entry of header.files) {
    const path = normalizePath(entry.path);
    if (files.has(path)) fail("DUPLICATE_PATH", `Duplicate MiniApp file: ${path}`);
    if (!FILE_KINDS.has(entry.kind)) fail("INVALID_FILE_KIND", `Unsupported MiniApp file kind: ${entry.kind}`);
    if (!Number.isSafeInteger(entry.offset) || !Number.isSafeInteger(entry.length) || entry.offset !== expectedOffset || entry.length < 0 || entry.length > MAX_FILE_BYTES || entry.offset + entry.length > contentLength) fail("INVALID_FILE_INDEX", `Invalid file index: ${path}`);
    const data = archive.subarray(contentStart + entry.offset, contentStart + entry.offset + entry.length);
    if (verify && await sha256Hex(data) !== entry.sha256) fail("CHECKSUM_MISMATCH", `Checksum mismatch for ${path}.`);
    files.set(path, Object.freeze({ ...entry, path, data }));
    expectedOffset += entry.length;
  }
  if (expectedOffset !== contentLength) fail("INVALID_FILE_INDEX", "MiniApp file index does not cover its content.");
  if (!files.has(manifest.runtime.mainModule)) fail("MAIN_MODULE_MISSING", "MiniApp main module is missing.");
  return { formatVersion: FORMAT_VERSION, manifest, files, packageId: await sha256Hex(archive), byteLength: archive.byteLength, archive };
}

export function mediaTypeForPath(path) {
  const extension = path.toLowerCase().split(".").at(-1);
  return ({ css: "text/css; charset=utf-8", html: "text/html; charset=utf-8", js: "text/javascript; charset=utf-8", mjs: "text/javascript; charset=utf-8", json: "application/json; charset=utf-8", png: "image/png", svg: "image/svg+xml", txt: "text/plain; charset=utf-8", wasm: "application/wasm" })[extension] || "application/octet-stream";
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function filesBelow(directory) {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = [];
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) files.push(...await filesBelow(path));
      else if (entry.isFile()) files.push(path);
    }
    return files;
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
}

function moduleKind(path) {
  const extension = path.toLowerCase().split(".").at(-1);
  if (extension === "wasm") return "wasm";
  if (extension === "json") return "json";
  if (["txt", "html", "css", "svg"].includes(extension)) return "text";
  return "module";
}

function generatedAdapter(importPath) {
  return `import application from ${JSON.stringify(importPath)};

if (!application || typeof application.fetch !== "function") {
  throw new TypeError("Nitro Cloudflare output must default-export an object with fetch(request, env, context).");
}

export default {
  fetch(request, runtime) {
    return application.fetch(request, Object.freeze({
      ASSETS: runtime.assets,
      CODEBOLT_MINIAPP_RUNTIME: runtime,
    }), Object.freeze({
      waitUntil: runtime.waitUntil,
      passThroughOnException() {},
    }));
  },
};
`;
}

export async function buildNitroMiniAppArchive({ outputDir, manifest: overrides = {} }) {
  const root = resolve(outputDir);
  const nitro = await readJson(resolve(root, "nitro.json"));
  if (nitro.preset !== "cloudflare-module") fail("UNSUPPORTED_NITRO_PRESET", `Expected cloudflare-module, received ${nitro.preset || "unknown"}.`);
  const cloudflare = await readJson(resolve(root, "server", "wrangler.json"));
  const sourceManifest = await readJson(resolve(root, "codebolt", "miniapp.manifest.json"));
  const serverEntry = String(nitro.serverEntry || sourceManifest.runtime?.handler || "server/index.mjs").replaceAll("\\", "/");
  const serverRoot = resolve(root, "server");
  const publicRoot = resolve(root, nitro.publicDir || sourceManifest.runtime?.publicDir || "public");
  const serverFiles = (await filesBelow(serverRoot)).filter((path) => relative(serverRoot, path).replaceAll("\\", "/") !== "wrangler.json");
  const publicFiles = await filesBelow(publicRoot);
  if (!serverFiles.some((path) => relative(root, path).replaceAll("\\", "/") === serverEntry)) fail("NITRO_ENTRY_MISSING", serverEntry);

  const files = [];
  for (const path of serverFiles) {
    const relativeToServer = relative(serverRoot, path).replaceAll("\\", "/");
    files.push({ path: `modules/nitro/${relativeToServer}`, kind: moduleKind(path), mediaType: mediaTypeForPath(path), data: await readFile(path) });
  }
  for (const path of publicFiles) {
    const relativeToPublic = relative(publicRoot, path).replaceAll("\\", "/");
    files.push({ path: `public/${relativeToPublic}`, kind: "asset", mediaType: mediaTypeForPath(path), data: await readFile(path) });
  }
  const nitroEntry = `./nitro/${relative(serverRoot, resolve(root, serverEntry)).replaceAll("\\", "/")}`;
  files.push({ path: "modules/__nitro_adapter.mjs", kind: "module", mediaType: "text/javascript; charset=utf-8", data: generatedAdapter(nitroEntry) });

  const hasIndex = publicFiles.some((path) => relative(publicRoot, path).replaceAll("\\", "/") === "index.html");
  const manifest = {
    format: "codebolt.miniapp.v1",
    id: overrides.id ?? sourceManifest.id,
    title: overrides.title ?? sourceManifest.title,
    version: overrides.version ?? sourceManifest.version,
    description: overrides.description ?? sourceManifest.description ?? "",
    runtime: {
      protocol: "codebolt.fetch.v1",
      mainModule: "modules/__nitro_adapter.mjs",
      compatibilityDate: overrides.compatibilityDate ?? cloudflare.compatibility_date,
      compatibilityFlags: overrides.compatibilityFlags ?? cloudflare.compatibility_flags ?? [],
    },
    ...(hasIndex ? { ui: { ...(sourceManifest.ui || {}), entry: "public/index.html" } } : {}),
    tools: overrides.tools ?? sourceManifest.tools ?? [],
    collections: overrides.collections ?? sourceManifest.collections ?? [],
    capabilities: overrides.capabilities ?? sourceManifest.capabilities ?? [],
    installPolicy: overrides.installPolicy ?? sourceManifest.installPolicy,
    defaultAccess: overrides.defaultAccess ?? sourceManifest.defaultAccess,
    build: { adapter: "nitro", frameworkVersion: nitro.framework?.version ?? nitro.versions?.nitro, preset: nitro.preset },
  };
  const archive = await buildMiniAppArchive({ manifest, files });
  return { archive, manifest, sourceManifest, moduleCount: serverFiles.length, assetCount: publicFiles.length };
}
