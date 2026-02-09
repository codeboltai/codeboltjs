// --- Enums and Constants ---

/** Inbox message status */
export type InboxMessageStatus = 'unread' | 'read' | 'acknowledged' | 'resolved';

/** Inbox message priority */
export type InboxMessagePriority = 'low' | 'normal' | 'high' | 'urgent';

// --- Core Entities ---

/** Inbox message */
export interface InboxMessage {
  id: string;
  title?: string;
  body: string;
  sender?: string;
  senderName?: string;
  status: InboxMessageStatus;
  priority?: InboxMessagePriority;
  threadId?: string;
  taskId?: string;
  createdAt: string;
  updatedAt?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  metadata?: Record<string, unknown>;
}

// --- Request Types ---

/** Create inbox message request */
export interface CreateInboxMessageRequest {
  title?: string;
  body: string;
  sender?: string;
  senderName?: string;
  priority?: InboxMessagePriority;
  threadId?: string;
  taskId?: string;
  metadata?: Record<string, unknown>;
}

/** Inbox message list params */
export interface InboxMessageListParams {
  status?: InboxMessageStatus;
  priority?: InboxMessagePriority;
  sender?: string;
  limit?: number;
  offset?: number;
}
