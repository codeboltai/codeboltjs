export interface Env {
  MINIAPP_PACKAGES: R2Bucket;
  MINIAPP_SUPERVISORS: DurableObjectNamespace<MiniAppSupervisor>;
  MINIAPP_STORAGE: DurableObjectNamespace<MiniAppStorage>;
  MINIAPP_LOADER: WorkerLoader;
  MINIAPP_SERVER_TOKEN?: string;
}

export interface MiniAppAssetProps {
  packageId: string;
}

export interface MiniAppInstanceRecord {
  id: string;
  scopeId: string;
  packageId: string;
  miniAppId: string;
  version: string;
  status: "ready" | "stopped";
  revision: number;
  createdAt: string;
  updatedAt: string;
}

export interface MiniAppSupervisor extends DurableObject {
  fetch(request: Request): Promise<Response>;
}

export interface MiniAppStorage extends DurableObject {
  get(collection: string, id: string): Promise<unknown | null>;
  getMany(collection: string, ids: string[]): Promise<Array<unknown | null>>;
  set(collection: string, id: string, value: unknown): Promise<unknown>;
  setMany(collection: string, documents: Array<{ id: string; document: unknown }>): Promise<unknown[]>;
  delete(collection: string, id: string): Promise<boolean>;
  deleteMany(collection: string, ids: string[]): Promise<number>;
  list(collection: string, options?: { prefix?: string; cursor?: string; limit?: number }): Promise<{ documents: unknown[]; cursor?: string }>;
  blobGet(key: string): Promise<{ key: string; data: Uint8Array; contentType?: string } | null>;
  blobPut(key: string, data: Uint8Array, options?: { contentType?: string }): Promise<void>;
  blobDelete(key: string): Promise<boolean>;
  blobList(options?: { prefix?: string; cursor?: string; limit?: number }): Promise<{ keys: string[]; cursor?: string }>;
  deleteAll(): Promise<void>;
}

declare global {
  interface WorkerLoader {
    get(name: string, getCode: () => WorkerLoaderWorkerCode | Promise<WorkerLoaderWorkerCode>): WorkerStub;
  }
  interface WorkerLoaderWorkerCode {
    compatibilityDate: string;
    compatibilityFlags?: string[];
    mainModule: string;
    modules: Record<string, string | { js?: string; text?: string; data?: ArrayBuffer; wasm?: ArrayBuffer }>;
    env?: unknown;
    globalOutbound?: Fetcher | null;
    limits?: { cpuMs?: number; subRequests?: number };
  }
  interface DurableObjectState {
    exports: {
      MiniAppAssets(options: { props: MiniAppAssetProps }): Fetcher;
    };
  }
  interface WorkerStub {
    getDurableObjectClass<T = DurableObject>(name: string): DurableObjectClass<T>;
  }
}
