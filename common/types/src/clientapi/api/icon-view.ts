// Icon View API types

export interface IconViewHistoryEntry {
  threadId: string;
  messageId: string;
  type: string;
  content?: string;
  timestamp: string;
}

export interface BatchIconViewHistoryRequest {
  threadIds: string[];
}

export interface IconViewMessage {
  threadId: string;
  messageId: string;
  type: string;
  content?: string;
  metadata?: Record<string, unknown>;
}
