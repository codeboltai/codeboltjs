// KV Store API types

export interface KvStoreInstance {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateKvStoreInstanceRequest {
  name: string;
  description?: string;
}

export interface UpdateKvStoreInstanceRequest {
  name?: string;
  description?: string;
}

export interface KvValue {
  key: string;
  value: unknown;
  namespace: string;
  instanceId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SetKvValueRequest {
  instanceId: string;
  namespace: string;
  key: string;
  value: unknown;
}

export interface KvQueryRequest {
  instanceId: string;
  namespace?: string;
  keyPrefix?: string;
  limit?: number;
  offset?: number;
}
