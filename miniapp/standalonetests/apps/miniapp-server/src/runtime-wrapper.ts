export function runtimeWrapper(mainModule: string): string {
  return `
import { DurableObject } from "cloudflare:workers";
import application from ${JSON.stringify(`./${mainModule}`)};

if (!application || typeof application.fetch !== "function") {
  throw new TypeError("MiniApp main module must default-export an object with fetch(request, runtime).");
}

export class MiniAppFacet extends DurableObject {
  async fetch(request) {
    const runtime = Object.freeze({
      instance: Object.freeze(this.env.INSTANCE),
      storage: Object.freeze({
        get: (collection, id) => this.env.STORAGE.get(collection, id),
        set: (collection, id, value) => this.env.STORAGE.set(collection, id, value),
        delete: (collection, id) => this.env.STORAGE.delete(collection, id),
        list: (collection) => this.env.STORAGE.list(collection),
      }),
      waitUntil: (promise) => this.ctx.waitUntil(promise),
    });
    return application.fetch(request, runtime);
  }
}
`;
}
