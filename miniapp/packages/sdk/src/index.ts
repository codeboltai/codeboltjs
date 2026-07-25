export type JsonSchema = Record<string, unknown>;
export type DocumentValue = Record<string, unknown>;

export interface Principal {
  userId: string;
  roles: string[];
}

export interface DocumentStore {
  get<T extends DocumentValue>(collection: string, id: string): Promise<T | null>;
  getMany<T extends DocumentValue>(
    collection: string,
    ids: string[],
  ): Promise<Array<T | null>>;
  set<T extends DocumentValue>(
    collection: string,
    id: string,
    document: T,
  ): Promise<T>;
  setMany<T extends DocumentValue>(
    collection: string,
    documents: Array<{ id: string; document: T }>,
  ): Promise<T[]>;
  delete(collection: string, id: string): Promise<boolean>;
  deleteMany(collection: string, ids: string[]): Promise<number>;
  list<T extends DocumentValue>(
    collection: string,
    options?: { prefix?: string; cursor?: string; limit?: number },
  ): Promise<{ documents: T[]; cursor?: string }>;
}

export interface BlobStore {
  get(key: string): Promise<{ data: Uint8Array; contentType?: string } | null>;
  put(
    key: string,
    data: Uint8Array,
    options?: { contentType?: string },
  ): Promise<void>;
  delete(key: string): Promise<boolean>;
  list(options?: {
    prefix?: string;
    cursor?: string;
    limit?: number;
  }): Promise<{ keys: string[]; cursor?: string }>;
}

export interface TaskService {
  create(input: {
    title: string;
    entityType?: string;
    entityId?: string;
  }): Promise<DocumentValue>;
  list(filter?: {
    entityType?: string;
    entityId?: string;
  }): Promise<DocumentValue[]>;
  count(filter?: { entityType?: string; entityId?: string }): Promise<number>;
}

export interface MiniAppContext {
  miniAppId: string;
  installId: string;
  workspaceId: string;
  principal: Principal;
  db: DocumentStore;
  blob: BlobStore;
  codebolt: {
    tasks: TaskService;
  };
}

export interface ToolDefinition<TInput = unknown, TOutput = unknown> {
  kind: "tool";
  name: string;
  description: string;
  inputSchema: JsonSchema;
  outputSchema?: JsonSchema;
  handler: (context: MiniAppContext, input: TInput) => Promise<TOutput> | TOutput;
}

export interface CollectionDefinition {
  kind: "collection";
  name: string;
  schema: JsonSchema;
}

export interface ViewDefinition {
  kind: "view";
  name: string;
  title: string;
  route: string;
}

export function defineTool<TInput = unknown, TOutput = unknown>(
  definition: Omit<ToolDefinition<TInput, TOutput>, "kind">,
): ToolDefinition<TInput, TOutput> {
  return { kind: "tool", ...definition };
}

export function defineCollection(
  definition: Omit<CollectionDefinition, "kind">,
): CollectionDefinition {
  return { kind: "collection", ...definition };
}

export function defineView(
  definition: Omit<ViewDefinition, "kind">,
): ViewDefinition {
  return { kind: "view", ...definition };
}

interface RuntimeBridge {
  getContext(): Omit<MiniAppContext, "db" | "blob" | "codebolt">;
  call<T>(capability: string, input: unknown): Promise<T>;
}

const runtimeSymbol = Symbol.for("codebolt.miniapp.runtime");

interface MiniAppEvent {
  req: {
    headers: Headers;
  };
}

function decodeClaims(token: string) {
  const payload = token.split(".")[1];
  if (!payload) throw new Error("INVALID_EXECUTION_TOKEN");
  const normalized = payload.replaceAll("-", "+").replaceAll("_", "/");
  const binary = atob(normalized);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

function remoteBridge(event: MiniAppEvent): RuntimeBridge {
  const token =
    event.req.headers.get("x-codebolt-execution-token") ??
    event.req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const processEnvironment = (
    globalThis as typeof globalThis & {
      process?: { env?: Record<string, string | undefined> };
    }
  ).process?.env;
  const workerEnvironment = (
    globalThis as typeof globalThis & {
      __env__?: Record<string, string | undefined>;
    }
  ).__env__;
  const cloudUrl =
    processEnvironment?.CODEBOLT_CLOUD_URL ??
    workerEnvironment?.CODEBOLT_CLOUD_URL;
  if (!token || !cloudUrl) {
    throw new Error("Remote MiniApp execution context is unavailable.");
  }
  const claims = decodeClaims(token);
  const principal =
    claims.principal ??
    {
      userId: claims.userId,
      roles: claims.roles ?? [],
    };
  return {
    getContext: () => ({
      miniAppId: claims.miniAppId,
      installId: claims.installId,
      workspaceId: claims.workspaceId,
      principal,
    }),
    async call<T>(capability: string, input: unknown): Promise<T> {
      const response = await fetch(
        `${cloudUrl.replace(/\/$/, "")}/capabilities/${encodeURIComponent(capability)}`,
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${token}`,
            "content-type": "application/json",
          },
          body: JSON.stringify(input),
        },
      );
      if (!response.ok) {
        throw new Error(`CLOUD_CAPABILITY_FAILED:${response.status}`);
      }
      return response.json() as Promise<T>;
    },
  };
}

function getBridge(event?: MiniAppEvent): RuntimeBridge {
  const bridge = (globalThis as Record<PropertyKey, unknown>)[runtimeSymbol];
  if (bridge) return bridge as RuntimeBridge;
  if (event) return remoteBridge(event);
  throw new Error("MiniApp runtime context is unavailable.");
}

export function useMiniApp(event?: MiniAppEvent): MiniAppContext {
  const bridge = getBridge(event);
  const identity = bridge.getContext();
  return {
    ...identity,
    db: {
      get: (collection, id) => bridge.call("db.get", { collection, id }),
      getMany: (collection, ids) => bridge.call("db.getMany", { collection, ids }),
      set: (collection, id, document) =>
        bridge.call("db.set", { collection, id, document }),
      setMany: (collection, documents) =>
        bridge.call("db.setMany", { collection, documents }),
      delete: (collection, id) => bridge.call("db.delete", { collection, id }),
      deleteMany: (collection, ids) =>
        bridge.call("db.deleteMany", { collection, ids }),
      list: (collection, options = {}) =>
        bridge.call("db.list", { collection, options }),
    },
    blob: {
      get: (key) => bridge.call("blob.get", { key }),
      put: (key, data, options = {}) =>
        bridge.call("blob.put", { key, data, options }),
      delete: (key) => bridge.call("blob.delete", { key }),
      list: (options = {}) => bridge.call("blob.list", { options }),
    },
    codebolt: {
      tasks: {
        create: (input) => bridge.call("tasks.create", input),
        list: (filter = {}) => bridge.call("tasks.list", filter),
        count: (filter = {}) => bridge.call("tasks.count", filter),
      },
    },
  };
}
