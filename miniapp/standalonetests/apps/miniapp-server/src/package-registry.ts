import { parseMiniAppArchive } from "../../../packages/miniapp-format/src/index.mjs";
import type { Env } from "./types";

export async function installPackage(env: Env, bytes: ArrayBuffer) {
  const parsed = await parseMiniAppArchive(bytes);
  const key = `packages/${parsed.packageId}.miniapp`;
  const existing = await env.MINIAPP_PACKAGES.head(key);
  if (!existing) {
    await env.MINIAPP_PACKAGES.put(key, bytes, {
      httpMetadata: { contentType: "application/vnd.codebolt.miniapp" },
      customMetadata: { miniAppId: parsed.manifest.id, version: parsed.manifest.version },
    });
  }
  return { packageId: parsed.packageId, manifest: parsed.manifest, bytes: parsed.byteLength, existing: Boolean(existing) };
}

export async function loadPackage(env: Env, packageId: string) {
  if (!/^[a-f0-9]{64}$/.test(packageId)) throw new Error("INVALID_PACKAGE_ID");
  const object = await env.MINIAPP_PACKAGES.get(`packages/${packageId}.miniapp`);
  if (!object) throw new Error("PACKAGE_NOT_FOUND");
  return parseMiniAppArchive(await object.arrayBuffer());
}
