import { DurableObject } from "cloudflare:workers";
import type { Env } from "./types";

function part(value: string, label: string): string {
  if (typeof value !== "string" || !/^[a-zA-Z0-9._-]+$/.test(value)) throw new Error(`INVALID_${label.toUpperCase()}`);
  return value;
}

export class MiniAppStorage extends DurableObject<Env> {
  private key(collection: string, id: string): string {
    return `document:${part(collection, "collection")}:${part(id, "id")}`;
  }

  async get(collection: string, id: string): Promise<unknown | null> {
    return await this.ctx.storage.get(this.key(collection, id)) ?? null;
  }

  async set(collection: string, id: string, value: unknown): Promise<unknown> {
    const document = value && typeof value === "object" && !Array.isArray(value) ? { ...(value as object), id } : { id, value };
    await this.ctx.storage.put(this.key(collection, id), document);
    return document;
  }

  async delete(collection: string, id: string): Promise<boolean> {
    return this.ctx.storage.delete(this.key(collection, id));
  }

  async list(collection: string): Promise<unknown[]> {
    const values = await this.ctx.storage.list({ prefix: `document:${part(collection, "collection")}:` });
    return [...values.values()];
  }

  async deleteAll(): Promise<void> {
    await this.ctx.storage.deleteAll();
  }
}
