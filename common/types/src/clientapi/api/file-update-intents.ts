// File Update Intents API types

export interface FileUpdateIntent {
  id: string;
  agentId: string;
  files: string[];
  status: 'active' | 'completed' | 'cancelled';
  description?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  cancelledAt?: string;
}

export interface CheckOverlapRequest {
  files: string[];
  agentId?: string;
}

export interface CheckOverlapResult {
  hasOverlap: boolean;
  overlappingFiles?: string[];
  overlappingIntents?: FileUpdateIntent[];
}

export interface BlockedFile {
  path: string;
  intentId: string;
  agentId: string;
}

export interface CreateFileUpdateIntentRequest {
  agentId: string;
  files: string[];
  description?: string;
}

export interface UpdateFileUpdateIntentRequest {
  files?: string[];
  description?: string;
}

export interface CompleteFileUpdateIntentRequest {
  summary?: string;
}

export interface CancelFileUpdateIntentRequest {
  reason?: string;
}
