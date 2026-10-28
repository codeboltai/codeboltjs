export function runtimeWrapper(mainModule: string): string {
  return `
import { DurableObject } from "cloudflare:workers";
import application from ${JSON.stringify(`./${mainModule}`)};

if (!application || typeof application.fetch !== "function") {
  throw new TypeError("MiniApp main module must default-export an object with fetch(request, runtime).");
}

export class MiniAppFacet extends DurableObject {
  async fetch(request) {
    const db = Object.freeze({
      get: (collection, id) => this.env.STORAGE.get(collection, id),
      getMany: (collection, ids) => this.env.STORAGE.getMany(collection, ids),
      set: (collection, id, document) => this.env.STORAGE.set(collection, id, document),
      setMany: (collection, documents) => this.env.STORAGE.setMany(collection, documents),
      delete: (collection, id) => this.env.STORAGE.delete(collection, id),
      deleteMany: (collection, ids) => this.env.STORAGE.deleteMany(collection, ids),
      list: (collection, options = {}) => this.env.STORAGE.list(collection, options),
    });
    const runtime = Object.freeze({
      instance: Object.freeze(this.env.INSTANCE),
      principal: Object.freeze({ userId: "miniapp-runtime", roles: [] }),
      db,
      blob: Object.freeze({
        get: (key) => this.env.STORAGE.blobGet(key),
        put: (key, data, options = {}) => this.env.STORAGE.blobPut(key, data, options),
        delete: (key) => this.env.STORAGE.blobDelete(key),
        list: (options = {}) => this.env.STORAGE.blobList(options),
      }),
      assets: this.env.ASSETS,
      codebolt: Object.freeze({
        tasks: Object.freeze({
          create: async (input) => {
            const id = "task-" + crypto.randomUUID();
            return db.set("__codebolt_tasks", id, { ...input, status: "open", createdAt: new Date().toISOString() });
          },
          list: async (filter = {}) => {
            const tasks = (await db.list("__codebolt_tasks")).documents;
            return tasks.filter((task) => (!filter.entityType || task.entityType === filter.entityType) && (!filter.entityId || task.entityId === filter.entityId));
          },
          count: async (filter = {}) => {
            const tasks = (await db.list("__codebolt_tasks")).documents;
            return tasks.filter((task) => (!filter.entityType || task.entityType === filter.entityType) && (!filter.entityId || task.entityId === filter.entityId)).length;
          },
        }),
      }),
      storage: Object.freeze({
        get: db.get,
        set: db.set,
        delete: db.delete,
        list: async (collection) => (await db.list(collection)).documents,
      }),
      waitUntil: (promise) => this.ctx.waitUntil(promise),
    });
    return application.fetch(request, runtime);
  }
}
`;
}
