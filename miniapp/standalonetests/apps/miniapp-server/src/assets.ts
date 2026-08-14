import { WorkerEntrypoint } from "cloudflare:workers";
import { mediaTypeForPath, parseMiniAppArchive } from "../../../packages/miniapp-format/src/index.mjs";
import type { Env, MiniAppAssetProps } from "./types";

function safePath(pathname: string): string {
  const path = decodeURIComponent(pathname).replace(/^\/+/, "") || "index.html";
  if (path.split("/").some((part) => !part || part === "." || part === "..")) throw new Error("INVALID_ASSET_PATH");
  return path;
}

export class MiniAppAssets extends WorkerEntrypoint<Env, MiniAppAssetProps> {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== "GET" && request.method !== "HEAD") return new Response("Method Not Allowed", { status: 405 });
    const path = safePath(new URL(request.url).pathname);
    const key = `assets/${this.ctx.props.packageId}/${path}`;
    let object = await this.env.MINIAPP_PACKAGES.get(key);
    let data: ArrayBuffer | Uint8Array | null = object ? await object.arrayBuffer() : null;
    let contentType = object?.httpMetadata?.contentType;
    if (!data) {
      const archive = await this.env.MINIAPP_PACKAGES.get(`packages/${this.ctx.props.packageId}.miniapp`);
      if (!archive) return new Response("Not Found", { status: 404 });
      const parsed = await parseMiniAppArchive(await archive.arrayBuffer());
      const asset = parsed.files.get(`public/${path}`);
      if (!asset || asset.kind !== "asset") return new Response("Not Found", { status: 404 });
      data = asset.data;
      contentType = asset.mediaType;
    }
    return new Response(request.method === "HEAD" ? null : data, {
      headers: { "content-type": contentType || mediaTypeForPath(path), "cache-control": "public, max-age=60" },
    });
  }
}
