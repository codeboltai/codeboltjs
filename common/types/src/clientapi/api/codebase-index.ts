// Codebase Index API types

export interface CodebaseIndexRequest {
  path?: string;
  force?: boolean;
}

export interface CodebaseIndexStatus {
  indexed: boolean;
  lastIndexedAt?: string;
  fileCount?: number;
  status: string;
}

export interface CodebaseChanges {
  hasChanges: boolean;
  changedFiles?: string[];
}

export interface CodebaseSearchRequest {
  query: string;
  limit?: number;
  fileTypes?: string[];
}

export interface CodebaseSearchResult {
  file: string;
  content: string;
  score: number;
  line?: number;
}
