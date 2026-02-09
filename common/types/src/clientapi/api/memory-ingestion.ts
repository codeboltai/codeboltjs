// Memory Ingestion API types

export interface IngestionPipeline {
  id: string;
  name: string;
  description?: string;
  processors: IngestionProcessor[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IngestionProcessor {
  type: string;
  config: Record<string, unknown>;
}

export interface CreateIngestionPipelineRequest {
  name: string;
  description?: string;
  processors: IngestionProcessor[];
}

export interface UpdateIngestionPipelineRequest {
  name?: string;
  description?: string;
  processors?: IngestionProcessor[];
}

export interface ExecuteIngestionPipelineRequest {
  input?: Record<string, unknown>;
}

export interface ValidateIngestionPipelineRequest {
  name?: string;
  processors: IngestionProcessor[];
}

export interface IngestionEvent {
  id: string;
  type: string;
  pipelineId?: string;
  data: Record<string, unknown>;
  createdAt: string;
}

export interface IngestionEventSchema {
  type: string;
  schema: Record<string, unknown>;
}

export interface DuplicateIngestionPipelineRequest {
  name?: string;
}
