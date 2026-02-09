// Memory API types

export type MemoryType = 'todo' | 'markdown' | 'json' | 'context' | 'episodic';

export interface MemoryThread {
  id: string;
  type: MemoryType;
  title?: string;
  archived?: boolean;
}

export interface CreateMemoryThreadRequest {
  type: MemoryType;
  title?: string;
  content?: string;
  data?: Record<string, unknown>;
}

export interface UpdateMemoryThreadRequest {
  title?: string;
  content?: string;
  data?: Record<string, unknown>;
  archived?: boolean;
}

export interface ListMemoryThreadsParams {
  type?: MemoryType;
  archived?: boolean;
  limit?: number;
  offset?: number;
}

export interface CreateMarkdownThreadRequest {
  title?: string;
  content?: string;
}

export interface UpdateMarkdownThreadRequest {
  title?: string;
}

export interface UpdateMarkdownContentRequest {
  content: string;
}

export interface CreateJsonThreadRequest {
  title?: string;
  data?: Record<string, unknown>;
}

export interface UpdateJsonThreadRequest {
  title?: string;
}

export interface UpdateJsonDataRequest {
  data: Record<string, unknown>;
}

export interface CreateContextThreadRequest {
  title?: string;
  sourceThreadId?: string;
  messages?: unknown[];
}

export interface UpdateContextThreadRequest {
  title?: string;
}

export interface SaveContextFromChatRequest {
  chatThreadId: string;
  messageIds?: string[];
  summary?: string;
}

export interface SummarizeContextRequest {
  maxLength?: number;
}

export interface CreateEpisodicMemoryRequest {
  title?: string;
  events?: unknown[];
}

export interface UpdateEpisodicMemoryRequest {
  title?: string;
}

export interface AddEpisodicEventsRequest {
  events: unknown[];
}

export interface EpisodicEventsParams {
  eventType?: string;
  limit?: number;
  offset?: number;
}
