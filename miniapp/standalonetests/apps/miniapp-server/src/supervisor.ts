import { DurableObject } from "cloudflare:workers";
import { loadPackage } from "./package-registry";
import { runtimeWrapper } from "./runtime-wrapper";
import type { Env, MiniAppInstanceRecord } from "./types";

const decoder = new TextDecoder();

function json(value: unknown, status = 200): Response {
  return Response.json(value, { status });
}

function cleanId(value: unknown, label: string): string {
  if (typeof value !== "string" || !/^[a-zA-Z0-9._-]+$/.test(value)) throw new Error(`INVALID_${label.toUpperCase()}`);
  return value;
}

export class MiniAppSupervisor extends DurableObject<Env> {
  async fetch(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      if (request.method === "POST" && url.pathname === "/instances") return await this.create(request);
      if (request.method === "GET" && url.pathname === "/instances") return await this.list();
      const match = url.pathname.match(/^\/instances\/([^/]+)(?:\/(run|stop))?$/);
      if (match) {
        const instanceId = cleanId(match[1], "instance_id");
        if (request.method === "GET" && !match[2]) return await this.get(instanceId);
        if (request.method === "PATCH" && !match[2]) return await this.update(instanceId, request);
        if (request.method === "DELETE" && !match[2]) return await this.remove(instanceId);
        if (request.method === "POST" && match[2] === "stop") return await this.stop(instanceId);
        if (match[2] === "run") return await this.run(instanceId, request);
      }
      return json({ error: "NOT_FOUND" }, 404);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const status = message === "INSTANCE_NOT_FOUND" || message === "PACKAGE_NOT_FOUND" ? 404 : 400;
      return json({ error: message }, status);
    }
  }

  private async record(id: string): Promise<MiniAppInstanceRecord> {
    const record = await this.ctx.storage.get<MiniAppInstanceRecord>(`instance:${id}`);
    if (!record) throw new Error("INSTANCE_NOT_FOUND");
    return record;
  }

  private async create(request: Request): Promise<Response> {
    const body = await request.json<{ packageId?: string; instanceId?: string }>();
    const scopeId = cleanId(request.headers.get("x-miniapp-scope-id"), "scope_id");
    const packageId = cleanId(body.packageId, "package_id");
    const parsed = await loadPackage(this.env, packageId);
    const id = cleanId(body.instanceId || `mi-${crypto.randomUUID()}`, "instance_id");
    if (await this.ctx.storage.get(`instance:${id}`)) return json({ error: "INSTANCE_EXISTS" }, 409);
    const now = new Date().toISOString();
    const record: MiniAppInstanceRecord = { id, scopeId, packageId, miniAppId: parsed.manifest.id, version: parsed.manifest.version, status: "ready", revision: 1, createdAt: now, updatedAt: now };
    await this.ctx.storage.put(`instance:${id}`, record);
    return json({ instance: record }, 201);
  }

  private async list(): Promise<Response> {
    const records = await this.ctx.storage.list<MiniAppInstanceRecord>({ prefix: "instance:" });
    return json({ instances: [...records.values()] });
  }

  private async get(id: string): Promise<Response> {
    return json({ instance: await this.record(id) });
  }

  private async update(id: string, request: Request): Promise<Response> {
    const record = await this.record(id);
    const body = await request.json<{ packageId?: string }>();
    const packageId = cleanId(body.packageId, "package_id");
    const parsed = await loadPackage(this.env, packageId);
    const updated: MiniAppInstanceRecord = { ...record, packageId, miniAppId: parsed.manifest.id, version: parsed.manifest.version, status: "ready", revision: record.revision + 1, updatedAt: new Date().toISOString() };
    await this.ctx.storage.put(`instance:${id}`, updated);
    this.ctx.facets.abort(this.facetName(id), new Error("MiniApp package revision changed."));
    return json({ instance: updated });
  }

  private async stop(id: string): Promise<Response> {
    const record = await this.record(id);
    const stopped = { ...record, status: "stopped" as const, updatedAt: new Date().toISOString() };
    await this.ctx.storage.put(`instance:${id}`, stopped);
    this.ctx.facets.abort(this.facetName(id), new Error("MiniApp stopped."));
    return json({ instance: stopped });
  }

  private async remove(id: string): Promise<Response> {
    const record = await this.record(id);
    this.ctx.facets.delete(this.facetName(id));
    await this.env.MINIAPP_STORAGE.getByName(`${record.scopeId}:${id}`).deleteAll();
    await this.ctx.storage.delete(`instance:${id}`);
    return json({ deleted: true, instanceId: id });
  }

  private facetName(id: string): string {
    return `miniapp:${id}`;
  }

  private async run(id: string, request: Request): Promise<Response> {
    const record = await this.record(id);
    if (record.status === "stopped") {
      record.status = "ready";
      record.updatedAt = new Date().toISOString();
      await this.ctx.storage.put(`instance:${id}`, record);
    }
    const parsed = await loadPackage(this.env, record.packageId);
    const runPath = request.headers.get("x-miniapp-run-path") || "/";
    const assetPath = runPath === "/" ? parsed.manifest.ui?.entry : `public/${runPath.replace(/^\/+/, "")}`;
    const asset = assetPath ? parsed.files.get(assetPath) : undefined;
    if ((request.method === "GET" || request.method === "HEAD") && asset?.kind === "asset") {
      return new Response(request.method === "HEAD" ? null : asset.data, { headers: { "content-type": asset.mediaType, "cache-control": "public, max-age=60" } });
    }

    const modules: Record<string, { js: string }> = {};
    for (const file of parsed.files.values()) {
      if (file.kind === "module") modules[file.path] = { js: decoder.decode(file.data) };
    }
    const wrapperName = "__miniapp_server_runtime.mjs";
    modules[wrapperName] = { js: runtimeWrapper(parsed.manifest.runtime.mainModule) };
    const storage = this.env.MINIAPP_STORAGE.getByName(`${record.scopeId}:${id}`);
    const workerId = `${this.ctx.id.toString()}:${id}:${record.packageId}:${record.revision}`;
    const worker = this.env.MINIAPP_LOADER.get(workerId, async () => ({
      compatibilityDate: parsed.manifest.runtime.compatibilityDate,
      compatibilityFlags: parsed.manifest.runtime.compatibilityFlags || [],
      mainModule: wrapperName,
      modules,
      env: { INSTANCE: { scopeId: record.scopeId, instanceId: id, packageId: record.packageId, miniAppId: record.miniAppId, version: record.version }, STORAGE: storage },
      globalOutbound: null,
      limits: { cpuMs: 100, subRequests: 50 },
    }));
    const facet = this.ctx.facets.get(this.facetName(id), () => ({ class: worker.getDurableObjectClass("MiniAppFacet"), id: this.facetName(id) }));
    const target = new URL(request.url);
    target.pathname = runPath;
    const forwarded = new Request(target, request);
    forwarded.headers.delete("x-miniapp-run-path");
    return facet.fetch(forwarded);
  }
}
