// VectorDB API types

export interface VectorCollection {
  id: string;
  name: string;
  description?: string;
  dimension?: number;
  documentCount?: number;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface VectorDocument {
  id: string;
  collectionId: string;
  content: string;
  embedding?: number[];
  metadata?: Record<string, unknown>;
  createdAt?: string;
}

export interface VectorSearchResult {
  id: string;
  content: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export interface CreateVectorCollectionRequest {
  name: string;
  description?: string;
  dimension?: number;
  metadata?: Record<string, unknown>;
}

export interface UpdateVectorCollectionRequest {
  name?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface AddVectorDocumentsRequest {
  documents: {
    content: string;
    metadata?: Record<string, unknown>;
    embedding?: number[];
  }[];
}

export interface DeleteVectorDocumentsRequest {
  documentIds?: string[];
}

export interface VectorChunk {
  id: string;
  documentId: string;
  content: string;
  embedding?: number[];
  metadata?: Record<string, unknown>;
}

export interface AddVectorChunksRequest {
  chunks: {
    content: string;
    metadata?: Record<string, unknown>;
    embedding?: number[];
  }[];
}

export interface VectorQueryRequest {
  query: string;
  limit?: number;
  threshold?: number;
  filter?: Record<string, unknown>;
}

export interface VectorCollectionSettings {
  embeddingModel?: string;
  chunkSize?: number;
  chunkOverlap?: number;
  [key: string]: unknown;
}

export interface UpdateVectorSettingsRequest {
  embeddingModel?: string;
  chunkSize?: number;
  chunkOverlap?: number;
  [key: string]: unknown;
}

export interface CreateVectorIndexRequest {
  collectionId: string;
  type?: string;
  config?: Record<string, unknown>;
}
