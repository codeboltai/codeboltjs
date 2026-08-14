import { readFile, readdir } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { buildMiniAppArchive, mediaTypeForPath } from "../../miniapp-format/src/index.mjs";

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
    const env = Object.freeze({
      ASSETS: runtime.assets,
      CODEBOLT_MINIAPP_RUNTIME: runtime,
    });
    const context = Object.freeze({
      waitUntil: runtime.waitUntil,
      passThroughOnException() {},
    });
    return application.fetch(request, env, context);
  },
};
`;
}

export async function buildNitroMiniAppArchive({ outputDir, manifest: overrides = {} }) {
  const root = resolve(outputDir);
  const nitro = await readJson(resolve(root, "nitro.json"));
  if (nitro.preset !== "cloudflare-module") {
    throw new Error(`UNSUPPORTED_NITRO_PRESET: expected cloudflare-module, received ${nitro.preset || "unknown"}.`);
  }
  const cloudflare = await readJson(resolve(root, "server", "wrangler.json"));
  const sourceManifest = await readJson(resolve(root, "codebolt", "miniapp.manifest.json"));
  const serverEntry = String(nitro.serverEntry || sourceManifest.runtime?.handler || "server/index.mjs").replaceAll("\\", "/");
  const serverRoot = resolve(root, "server");
  const publicRoot = resolve(root, nitro.publicDir || sourceManifest.runtime?.publicDir || "public");
  const serverFiles = (await filesBelow(serverRoot)).filter((path) => relative(serverRoot, path).replaceAll("\\", "/") !== "wrangler.json");
  const publicFiles = await filesBelow(publicRoot);
  if (!serverFiles.some((path) => relative(root, path).replaceAll("\\", "/") === serverEntry)) {
    throw new Error(`NITRO_ENTRY_MISSING: ${serverEntry}`);
  }

  const files = [];
  for (const path of serverFiles) {
    const relativeToServer = relative(serverRoot, path).replaceAll("\\", "/");
    files.push({
      path: `modules/nitro/${relativeToServer}`,
      kind: moduleKind(path),
      mediaType: mediaTypeForPath(path),
      data: await readFile(path),
    });
  }
  for (const path of publicFiles) {
    const relativeToPublic = relative(publicRoot, path).replaceAll("\\", "/");
    files.push({ path: `public/${relativeToPublic}`, kind: "asset", mediaType: mediaTypeForPath(path), data: await readFile(path) });
  }
  const nitroEntry = `./nitro/${relative(serverRoot, resolve(root, serverEntry)).replaceAll("\\", "/")}`;
  files.push({ path: "modules/__nitro_adapter.mjs", kind: "module", mediaType: "text/javascript; charset=utf-8", data: generatedAdapter(nitroEntry) });

  const manifest = {
    format: "codebolt.miniapp.v1",
    id: overrides.id ?? sourceManifest.id,
    title: overrides.title ?? sourceManifest.title,
    version: overrides.version ?? sourceManifest.version,
    runtime: {
      protocol: "codebolt.fetch.v1",
      mainModule: "modules/__nitro_adapter.mjs",
      compatibilityDate: overrides.compatibilityDate ?? cloudflare.compatibility_date,
      compatibilityFlags: overrides.compatibilityFlags ?? cloudflare.compatibility_flags ?? [],
    },
    ...(publicFiles.some((path) => relative(publicRoot, path).replaceAll("\\", "/") === "index.html") ? { ui: { entry: "public/index.html" } } : {}),
    capabilities: overrides.capabilities ?? sourceManifest.capabilities ?? [],
    build: {
      adapter: "nitro",
      frameworkVersion: nitro.framework?.version ?? nitro.versions?.nitro,
      preset: nitro.preset,
    },
  };
  const archive = await buildMiniAppArchive({ manifest, files });
  return { archive, manifest, sourceManifest, moduleCount: serverFiles.length, assetCount: publicFiles.length };
}
