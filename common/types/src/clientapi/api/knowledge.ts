// Knowledge API types

export interface KnowledgeCollection {
  id: string;
  name: string;
  description?: string;
  type?: 'documentation' | 'codebase' | 'custom';
  documentCount?: number;
  sourcePath?: string;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface KnowledgeDocument {
  id: string;
  collectionId: string;
  title: string;
  content: string;
  source?: string;
  type?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateKnowledgeCollectionRequest {
  name: string;
  description?: string;
  type?: 'documentation' | 'codebase' | 'custom';
  sourcePath?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateKnowledgeCollectionRequest {
  name?: string;
  description?: string;
  type?: 'documentation' | 'codebase' | 'custom';
  metadata?: Record<string, unknown>;
}

export interface AddKnowledgeDocumentsRequest {
  documents: {
    title: string;
    content: string;
    source?: string;
    type?: string;
    tags?: string[];
    metadata?: Record<string, unknown>;
  }[];
}

export interface AddKnowledgeDocumentFromUrlRequest {
  url: string;
  title?: string;
  type?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface RechunkDocumentRequest {
  strategy?: string;
  options?: Record<string, unknown>;
}

export interface UpdateKnowledgeChunkRequest {
  content?: string;
  metadata?: Record<string, unknown>;
}

export interface KnowledgeCollectionSettings {
  embeddingModel?: string;
  chunkStrategy?: string;
  chunkSize?: number;
  chunkOverlap?: number;
  [key: string]: unknown;
}

export interface UpdateKnowledgeSettingsRequest {
  embeddingModel?: string;
  chunkStrategy?: string;
  chunkSize?: number;
  chunkOverlap?: number;
  [key: string]: unknown;
}

export interface KnowledgeStrategy {
  name: string;
  description?: string;
}

export interface KnowledgeStrategyOptions {
  [key: string]: unknown;
}
