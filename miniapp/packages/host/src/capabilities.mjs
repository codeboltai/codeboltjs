import { createStorage } from "unstorage";
import fsDriver from "unstorage/drivers/fs-lite";
import { randomUUID } from "node:crypto";

function part(value, label) {
  if (typeof value !== "string" || !/^[a-zA-Z0-9._-]+$/.test(value)) {
    throw new Error(`INVALID_${label.toUpperCase()}`);
  }
  return value;
}

function namespace(claims) {
  return [
    part(claims.workspaceId, "workspace"),
    part(claims.installId, "install"),
    part(claims.miniAppId, "miniapp"),
  ].join(":");
}

function page(keys, options = {}) {
  const limit = Math.max(1, Math.min(Number(options.limit) || 100, 100));
  const start = options.cursor ? Math.max(0, keys.indexOf(options.cursor) + 1) : 0;
  const selected = keys.slice(start, start + limit);
  return {
    selected,
    cursor: start + limit < keys.length ? selected.at(-1) : undefined,
  };
}

export function createCapabilityService({ dataDir }) {
  const storage = createStorage({
    driver: fsDriver({ base: dataDir }),
  });

  const documentKey = (claims, collection, id) =>
    `db:${namespace(claims)}:${part(collection, "collection")}:${part(id, "id")}`;
  const documentPrefix = (claims, collection) =>
    `db:${namespace(claims)}:${part(collection, "collection")}:`;
  const blobKey = (claims, key) =>
    `blob:${namespace(claims)}:${part(key, "blob_key")}`;
  const blobPrefix = (claims) => `blob:${namespace(claims)}:`;
  const taskPrefix = (claims) =>
    `tasks:${part(claims.workspaceId, "workspace")}:`;

  return {
    async call(claims, capability, input) {
      switch (capability) {
        case "db.get":
          return await storage.getItem(
            documentKey(claims, input.collection, input.id),
          ) ?? null;
        case "db.getMany":
          return Promise.all(
            input.ids.map((id) =>
              storage.getItem(documentKey(claims, input.collection, id)),
            ),
          );
        case "db.set": {
          const document = { ...input.document, id: input.id };
          await storage.setItem(
            documentKey(claims, input.collection, input.id),
            document,
          );
          return document;
        }
        case "db.setMany":
          return Promise.all(
            input.documents.map(async ({ id, document }) => {
              const value = { ...document, id };
              await storage.setItem(
                documentKey(claims, input.collection, id),
                value,
              );
              return value;
            }),
          );
        case "db.delete":
          return storage.removeItem(
            documentKey(claims, input.collection, input.id),
          ).then(() => true);
        case "db.deleteMany":
          await Promise.all(
            input.ids.map((id) =>
              storage.removeItem(documentKey(claims, input.collection, id)),
            ),
          );
          return input.ids.length;
        case "db.list": {
          const prefix = documentPrefix(claims, input.collection);
          const keys = (await storage.getKeys(prefix))
            .filter((key) => {
              const id = key.slice(prefix.length);
              return !input.options?.prefix || id.startsWith(input.options.prefix);
            })
            .sort();
          const result = page(keys, input.options);
          return {
            documents: await Promise.all(
              result.selected.map((key) => storage.getItem(key)),
            ),
            ...(result.cursor ? { cursor: result.cursor } : {}),
          };
        }
        case "blob.get": {
          const value = await storage.getItem(blobKey(claims, input.key));
          return value
            ? {
                ...value,
                data: new Uint8Array(Buffer.from(value.data, "base64")),
              }
            : null;
        }
        case "blob.put":
          await storage.setItem(blobKey(claims, input.key), {
            data: Buffer.from(input.data).toString("base64"),
            contentType: input.options?.contentType,
          });
          return undefined;
        case "blob.delete":
          await storage.removeItem(blobKey(claims, input.key));
          return true;
        case "blob.list": {
          const prefix = blobPrefix(claims);
          const keys = (await storage.getKeys(prefix))
            .map((key) => key.slice(prefix.length))
            .filter((key) => !input.options?.prefix || key.startsWith(input.options.prefix))
            .sort();
          const result = page(keys, input.options);
          return {
            keys: result.selected,
            ...(result.cursor ? { cursor: result.cursor } : {}),
          };
        }
        case "tasks.create": {
          const id = randomUUID();
          const task = {
            id,
            title: input.title,
            entityType: input.entityType,
            entityId: input.entityId,
            status: "open",
            createdAt: new Date().toISOString(),
          };
          await storage.setItem(`${taskPrefix(claims)}${id}`, task);
          return task;
        }
        case "tasks.list": {
          const tasks = await Promise.all(
            (await storage.getKeys(taskPrefix(claims))).map((key) =>
              storage.getItem(key),
            ),
          );
          return tasks.filter(
            (task) =>
              (!input.entityType || task.entityType === input.entityType) &&
              (!input.entityId || task.entityId === input.entityId),
          );
        }
        case "tasks.count":
          return (
            await this.call(claims, "tasks.list", input)
          ).length;
        default:
          throw new Error(`UNKNOWN_CAPABILITY:${capability}`);
      }
    },
  };
}
