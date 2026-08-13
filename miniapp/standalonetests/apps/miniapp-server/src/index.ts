import { installPackage } from "./package-registry";
import { MiniAppStorage } from "./storage";
import { MiniAppSupervisor } from "./supervisor";
import type { Env } from "./types";

export { MiniAppStorage, MiniAppSupervisor };

function json(value: unknown, status = 200): Response {
  return Response.json(value, { status });
}

function authorized(request: Request, env: Env): boolean {
  if (!env.MINIAPP_SERVER_TOKEN) return true;
  return request.headers.get("authorization") === `Bearer ${env.MINIAPP_SERVER_TOKEN}`;
}

function cleanId(value: string, label: string): string {
  if (!/^[a-zA-Z0-9._-]+$/.test(value)) throw new Error(`INVALID_${label.toUpperCase()}`);
  return value;
}

function supervisor(env: Env, scopeId: string) {
  return env.MINIAPP_SUPERVISORS.getByName(cleanId(scopeId, "scope_id"));
}

function proxy(request: Request, stub: DurableObjectStub, pathname: string, headers?: HeadersInit) {
  const target = new URL(request.url);
  target.pathname = pathname;
  return stub.fetch(new Request(target, { method: request.method, headers: { ...Object.fromEntries(request.headers), ...headers }, body: request.body, ...(request.body ? { duplex: "half" as const } : {}) }));
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);
      if (request.method === "GET" && url.pathname === "/health") return json({ ok: true, service: "standalone-miniapp-server" });
      if (!authorized(request, env)) return json({ error: "UNAUTHORIZED" }, 401);
      if (request.method === "POST" && url.pathname === "/api/packages") {
        const length = Number(request.headers.get("content-length") || 0);
        if (length > 40 * 1024 * 1024) return json({ error: "PACKAGE_TOO_LARGE" }, 413);
        return json(await installPackage(env, await request.arrayBuffer()), 201);
      }
      const packageMatch = url.pathname.match(/^\/api\/packages\/([a-f0-9]{64})$/);
      if (request.method === "GET" && packageMatch) {
        const object = await env.MINIAPP_PACKAGES.head(`packages/${packageMatch[1]}.miniapp`);
        return object ? json({ packageId: packageMatch[1], bytes: object.size, metadata: object.customMetadata }) : json({ error: "PACKAGE_NOT_FOUND" }, 404);
      }
      const instanceMatch = url.pathname.match(/^\/api\/scopes\/([^/]+)\/instances(?:\/([^/]+)(?:\/(stop))?)?$/);
      if (instanceMatch) {
        const scopeId = cleanId(decodeURIComponent(instanceMatch[1]), "scope_id");
        const id = instanceMatch[2] ? cleanId(decodeURIComponent(instanceMatch[2]), "instance_id") : undefined;
        const path = id ? `/instances/${id}${instanceMatch[3] ? "/stop" : ""}` : "/instances";
        return proxy(request, supervisor(env, scopeId), path, { "x-miniapp-scope-id": scopeId });
      }
      const runMatch = url.pathname.match(/^\/run\/([^/]+)\/([^/]+)(\/.*)?$/);
      if (runMatch) {
        const scopeId = cleanId(decodeURIComponent(runMatch[1]), "scope_id");
        const instanceId = cleanId(decodeURIComponent(runMatch[2]), "instance_id");
        return proxy(request, supervisor(env, scopeId), `/instances/${instanceId}/run`, { "x-miniapp-run-path": runMatch[3] || "/" });
      }
      return json({ error: "NOT_FOUND" }, 404);
    } catch (error) {
      return json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  }
};
