// Persistent Memory API types

export interface PersistentMemoryType {
  id: string;
  name: string;
  description?: string;
  steps: PersistentMemoryStep[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PersistentMemoryStep {
  id: string;
  type: string;
  config: Record<string, unknown>;
  order: number;
}

export interface CreatePersistentMemoryTypeRequest {
  name: string;
  description?: string;
  steps: PersistentMemoryStep[];
}

export interface UpdatePersistentMemoryTypeRequest {
  name?: string;
  description?: string;
  steps?: PersistentMemoryStep[];
}

export interface ExecutePersistentMemoryRequest {
  input?: Record<string, unknown>;
}

export interface ValidatePersistentMemoryRequest {
  name?: string;
  steps: PersistentMemoryStep[];
}

export interface PersistentMemoryStepSpec {
  type: string;
  name: string;
  description?: string;
  configSchema: Record<string, unknown>;
  userConfigurable?: boolean;
}

export interface ImportPersistentMemoryRequest {
  config: Record<string, unknown>;
}

export interface DuplicatePersistentMemoryRequest {
  name?: string;
}
