import { DurableObject } from "cloudflare:workers";
import type { Env } from "./types";

function part(value: string, label: string): string {
  if (typeof value !== "string" || !/^[a-zA-Z0-9._-]+$/.test(value)) throw new Error(`INVALID_${label.toUpperCase()}`);
  return value;
}

function blobKey(value: string): string {
  if (typeof value !== "string" || !value || value.startsWith("/") || value.split("/").some((item) => !item || item === "." || item === "..") || !/^[a-zA-Z0-9._/-]+$/.test(value)) throw new Error("INVALID_BLOB_KEY");
  return value;
}

function limit(value: number | undefined): number {
  if (value === undefined) return 100;
  if (!Number.isInteger(value) || value < 1 || value > 1000) throw new Error("INVALID_LIMIT");
  return value;
}

export class MiniAppStorage extends DurableObject<Env> {
  private key(collection: string, id: string): string {
    return `document:${part(collection, "collection")}:${part(id, "id")}`;
  }

  async get(collection: string, id: string): Promise<unknown | null> {
    return await this.ctx.storage.get(this.key(collection, id)) ?? null;
  }

  async getMany(collection: string, ids: string[]): Promise<Array<unknown | null>> {
    return Promise.all(ids.map((id) => this.get(collection, id)));
  }

  async set(collection: string, id: string, value: unknown): Promise<unknown> {
    const document = value && typeof value === "object" && !Array.isArray(value) ? { ...(value as object), id } : { id, value };
    await this.ctx.storage.put(this.key(collection, id), document);
    return document;
  }

  async setMany(collection: string, documents: Array<{ id: string; document: unknown }>): Promise<unknown[]> {
    return this.ctx.storage.transaction(async (transaction) => {
      const values = documents.map(({ id, document }) => document && typeof document === "object" && !Array.isArray(document) ? { ...(document as object), id: part(id, "id") } : { id: part(id, "id"), value: document });
      await transaction.put(Object.fromEntries(values.map((document) => [this.key(collection, String((document as { id: string }).id)), document])));
      return values;
    });
  }

  async delete(collection: string, id: string): Promise<boolean> {
    return this.ctx.storage.delete(this.key(collection, id));
  }

  async deleteMany(collection: string, ids: string[]): Promise<number> {
    return this.ctx.storage.delete(ids.map((id) => this.key(collection, id)));
  }

  async list(collection: string, options: { prefix?: string; cursor?: string; limit?: number } = {}): Promise<{ documents: unknown[]; cursor?: string }> {
    const base = `document:${part(collection, "collection")}:`;
    const prefix = `${base}${options.prefix ? part(options.prefix, "prefix") : ""}`;
    const count = limit(options.limit);
    const values = await this.ctx.storage.list({ prefix, ...(options.cursor ? { startAfter: `${base}${part(options.cursor, "cursor")}` } : {}), limit: count + 1 });
    const entries = [...values.entries()];
    const page = entries.slice(0, count);
    return { documents: page.map(([, value]) => value), ...(entries.length > count && page.length ? { cursor: page.at(-1)![0].slice(base.length) } : {}) };
  }

  async blobGet(key: string): Promise<{ key: string; data: Uint8Array; contentType?: string } | null> {
    const name = blobKey(key);
    const value = await this.ctx.storage.get<{ data: Uint8Array; contentType?: string }>(`blob:${name}`);
    return value ? { key: name, ...value } : null;
  }

  async blobPut(key: string, data: Uint8Array, options: { contentType?: string } = {}): Promise<void> {
    const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
    await this.ctx.storage.put(`blob:${blobKey(key)}`, { data: bytes, ...(options.contentType ? { contentType: options.contentType } : {}) });
  }

  async blobDelete(key: string): Promise<boolean> {
    return this.ctx.storage.delete(`blob:${blobKey(key)}`);
  }

  async blobList(options: { prefix?: string; cursor?: string; limit?: number } = {}): Promise<{ keys: string[]; cursor?: string }> {
    const base = "blob:";
    const prefix = `${base}${options.prefix ? blobKey(options.prefix) : ""}`;
    const count = limit(options.limit);
    const values = await this.ctx.storage.list({ prefix, ...(options.cursor ? { startAfter: `${base}${blobKey(options.cursor)}` } : {}), limit: count + 1 });
    const keys = [...values.keys()].map((key) => key.slice(base.length));
    const page = keys.slice(0, count);
    return { keys: page, ...(keys.length > count && page.length ? { cursor: page.at(-1) } : {}) };
  }

  async deleteAll(): Promise<void> {
    await this.ctx.storage.deleteAll();
  }
}
