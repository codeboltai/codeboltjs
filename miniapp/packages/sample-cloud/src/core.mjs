function bytesFromString(value) {
  return new TextEncoder().encode(value);
}

function stringFromBytes(bytes) {
  return new TextDecoder().decode(bytes);
}

function encodeBase64url(bytes) {
  const buffer = globalThis.Buffer;
  const base64 = buffer
    ? buffer.from(bytes).toString("base64")
    : btoa(String.fromCharCode(...bytes));
  return base64.replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function decodeBase64url(value) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const buffer = globalThis.Buffer;
  if (buffer) return new Uint8Array(buffer.from(padded, "base64"));
  return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
}

function base64urlJson(value) {
  return encodeBase64url(bytesFromString(JSON.stringify(value)));
}

export function createDevToken({
  miniAppId,
  workspaceId = "sample-workspace",
  installId = "sample-install",
  userId = "sample-user",
  roles = ["tester"],
  ttlSeconds = 3600,
} = {}) {
  if (!miniAppId) throw new Error("miniAppId is required.");
  return [
    base64urlJson({ alg: "none", typ: "JWT" }),
    base64urlJson({
      userId,
      roles,
      workspaceId,
      installId,
      miniAppId,
      principal: { userId, roles },
      aud: miniAppId,
      exp: Math.floor(Date.now() / 1000) + Number(ttlSeconds),
    }),
    "dev",
  ].join(".");
}

function decodeDevToken(token) {
  const payload = token?.split(".")[1];
  if (!payload) throw new Error("INVALID_TOKEN");
  const claims = JSON.parse(stringFromBytes(decodeBase64url(payload)));
  if (claims.exp && Number(claims.exp) < Math.floor(Date.now() / 1000)) {
    throw new Error("EXPIRED_TOKEN");
  }
  for (const key of ["workspaceId", "installId", "miniAppId"]) {
    if (!claims[key]) throw new Error(`MISSING_${key.toUpperCase()}`);
  }
  return {
    ...claims,
    principal: claims.principal ?? {
      userId: claims.userId ?? "sample-user",
      roles: claims.roles ?? [],
    },
  };
}

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

function page(values, options = {}) {
  const limit = Math.max(1, Math.min(Number(options.limit) || 100, 100));
  const start = options.cursor
    ? Math.max(0, values.findIndex((value) => value.key === options.cursor) + 1)
    : 0;
  const selected = values.slice(start, start + limit);
  return {
    selected,
    cursor: start + limit < values.length ? selected.at(-1)?.key : undefined,
  };
}

async function readBody(request) {
  const text = await request.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("INVALID_JSON");
  }
}

function send(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "authorization,content-type,x-codebolt-execution-token",
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "content-type": "application/json",
    },
  });
}

function dataKey(claims, type, key) {
  return `${type}:${namespace(claims)}:${key}`;
}

function documentKey(claims, collection, id) {
  return dataKey(claims, "db", `${part(collection, "collection")}:${part(id, "id")}`);
}

function documentPrefix(claims, collection) {
  return dataKey(claims, "db", `${part(collection, "collection")}:`);
}

function blobKey(claims, key) {
  return dataKey(claims, "blob", part(key, "blob_key"));
}

function blobPrefix(claims) {
  return dataKey(claims, "blob", "");
}

function taskPrefix(claims) {
  return `tasks:${part(claims.workspaceId, "workspace")}:`;
}

export function createMemoryStore() {
  const values = new Map();
  return {
    async get(key) {
      return values.get(key) ?? null;
    },
    async put(key, value) {
      values.set(key, value);
    },
    async delete(key) {
      return values.delete(key);
    },
    async list(prefix) {
      return [...values.entries()]
        .filter(([key]) => key.startsWith(prefix))
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, value]) => ({ key, value }));
    },
  };
}

export function createKvStore(kv) {
  return {
    async get(key) {
      return kv.get(key, "json");
    },
    async put(key, value) {
      await kv.put(key, JSON.stringify(value));
    },
    async delete(key) {
      await kv.delete(key);
      return true;
    },
    async list(prefix) {
      const listed = await kv.list({ prefix });
      const entries = await Promise.all(
        listed.keys.map(async ({ name }) => ({ key: name, value: await kv.get(name, "json") })),
      );
      return entries.sort((left, right) => left.key.localeCompare(right.key));
    },
  };
}

export function createCapabilityStore(store = createMemoryStore()) {
  const calls = [];
  return {
    calls,
    async call(claims, capability, input) {
      calls.push({ capability, claims, input });
      switch (capability) {
        case "db.get":
          return store.get(documentKey(claims, input.collection, input.id));
        case "db.getMany":
          return Promise.all(input.ids.map((id) => store.get(documentKey(claims, input.collection, id))));
        case "db.set": {
          const document = { ...input.document, id: input.id };
          await store.put(documentKey(claims, input.collection, input.id), document);
          return document;
        }
        case "db.setMany":
          return Promise.all(
            input.documents.map(({ id, document }) =>
              this.call(claims, "db.set", { collection: input.collection, id, document }),
            ),
          );
        case "db.delete":
          return store.delete(documentKey(claims, input.collection, input.id));
        case "db.deleteMany": {
          for (const id of input.ids) await store.delete(documentKey(claims, input.collection, id));
          return input.ids.length;
        }
        case "db.list": {
          const prefix = documentPrefix(claims, input.collection);
          const values = (await store.list(prefix))
            .filter(({ key }) => !input.options?.prefix || key.slice(prefix.length).startsWith(input.options.prefix))
            .map(({ key, value }) => ({ key, document: value }));
          const result = page(values, input.options);
          return {
            documents: result.selected.map((value) => value.document),
            ...(result.cursor ? { cursor: result.cursor } : {}),
          };
        }
        case "blob.get":
          return store.get(blobKey(claims, input.key));
        case "blob.put":
          await store.put(blobKey(claims, input.key), {
            data: encodeBase64url(bytesFromString(String(input.data))),
            contentType: input.options?.contentType,
          });
          return undefined;
        case "blob.delete":
          return store.delete(blobKey(claims, input.key));
        case "blob.list": {
          const prefix = blobPrefix(claims);
          const keys = (await store.list(prefix))
            .map(({ key }) => key.slice(prefix.length))
            .filter((key) => !input.options?.prefix || key.startsWith(input.options.prefix))
            .map((key) => ({ key }));
          const result = page(keys, input.options);
          return {
            keys: result.selected.map((value) => value.key),
            ...(result.cursor ? { cursor: result.cursor } : {}),
          };
        }
        case "tasks.create": {
          const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
          const task = {
            id,
            title: input.title,
            entityType: input.entityType,
            entityId: input.entityId,
            status: "open",
            createdAt: new Date().toISOString(),
          };
          await store.put(`${taskPrefix(claims)}${id}`, task);
          return task;
        }
        case "tasks.list":
          return (await store.list(taskPrefix(claims)))
            .map(({ value }) => value)
            .filter((task) =>
              (!input.entityType || task.entityType === input.entityType) &&
              (!input.entityId || task.entityId === input.entityId),
            );
        case "tasks.count":
          return (await this.call(claims, "tasks.list", input)).length;
        default:
          throw new Error(`UNKNOWN_CAPABILITY:${capability}`);
      }
    },
  };
}

export async function handleSampleCloudRequest(request, options = {}) {
  const store = options.store ?? (
    options.env?.SAMPLE_CLOUD_STORE
      ? createKvStore(options.env.SAMPLE_CLOUD_STORE)
      : createMemoryStore()
  );
  const capabilities = options.capabilities ?? createCapabilityStore(store);

  try {
    if (request.method === "OPTIONS") return send(204, {});

    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/health") {
      return send(200, { ok: true });
    }

    if (request.method === "POST" && url.pathname === "/token") {
      return send(200, { token: createDevToken(await readBody(request)) });
    }

    if (request.method === "POST" && url.pathname.startsWith("/capabilities/")) {
      const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
      const claims = decodeDevToken(bearer);
      const capability = decodeURIComponent(url.pathname.slice("/capabilities/".length));
      return send(200, await capabilities.call(claims, capability, await readBody(request)));
    }

    return send(404, { error: "not found" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = message.includes("TOKEN") || message.includes("bearer") ? 401 : 500;
    return send(status, { error: message });
  }
}
