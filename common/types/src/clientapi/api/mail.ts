// --- Enums and Constants ---

/** Mail thread type */
export type MailThreadType = 'agent-to-agent' | 'agent-to-user' | 'group';

/** Mail thread status */
export type MailThreadStatus = 'open' | 'closed' | 'archived';

/** Mail importance */
export type MailImportance = 'low' | 'normal' | 'high' | 'urgent';

/** Contact policy */
export type ContactPolicy = 'open' | 'contacts_only';

// --- Core Entities ---

/** File reference in mail */
export interface FileReference {
  path: string;
  name: string;
  type: 'file' | 'folder';
  preview?: string;
}

/** Mail thread */
export interface MailThread {
  id: string;
  subject: string;
  type: MailThreadType;
  status: MailThreadStatus;
  participants: string[];
  createdAt: string;
  updatedAt: string;
  lastMessageId?: string;
  lastMessagePreview?: string;
  unreadCount: number;
  metadata?: Record<string, unknown>;
}

/** Mail message */
export interface MailMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  recipients: string[];
  body: string;
  importance: MailImportance;
  ackRequired: boolean;
  ackAt?: string;
  readAt?: string;
  fileReferences?: FileReference[];
  createdAt: string;
}

/** Mail agent info */
export interface MailAgent {
  id: string;
  name: string;
  program?: string;
  model?: string;
  lastActiveAt: string;
  contactPolicy: ContactPolicy;
}

/** Mail reservation */
export interface MailReservation {
  id: string;
  resourceId: string;
  reservedBy: string;
  reservedAt: string;
  expiresAt?: string;
  metadata?: Record<string, unknown>;
}

/** Mail thread summary */
export interface MailThreadSummary {
  threadId: string;
  summary: string;
  messageCount: number;
  participants: string[];
}

// --- Request Types ---

/** Create mail thread request */
export interface CreateMailThreadRequest {
  subject: string;
  type?: MailThreadType;
  participants: string[];
  metadata?: Record<string, unknown>;
}

/** Update mail thread request */
export interface UpdateMailThreadRequest {
  subject?: string;
  status?: MailThreadStatus;
  metadata?: Record<string, unknown>;
}

/** Send mail message request */
export interface SendMailMessageRequest {
  threadId?: string;
  senderId: string;
  senderName: string;
  recipients: string[];
  body: string;
  importance?: MailImportance;
  ackRequired?: boolean;
  fileReferences?: FileReference[];
}

/** Reply to message request */
export interface ReplyToMessageRequest {
  messageId: string;
  threadId: string;
  senderId: string;
  senderName: string;
  body: string;
  importance?: MailImportance;
  fileReferences?: FileReference[];
}

/** Create mail agent request */
export interface CreateMailAgentRequest {
  name: string;
  program?: string;
  model?: string;
  contactPolicy?: ContactPolicy;
}

/** Mail search params */
export interface MailSearchParams {
  query?: string;
  threadId?: string;
  senderId?: string;
  importance?: MailImportance;
  limit?: number;
  offset?: number;
}

/** Mail thread list params */
export interface MailThreadListParams {
  status?: MailThreadStatus;
  type?: MailThreadType;
  participant?: string;
  limit?: number;
  offset?: number;
}

/** Create reservation request */
export interface CreateReservationRequest {
  resourceId: string;
  reservedBy: string;
  duration?: number;
  metadata?: Record<string, unknown>;
}

/** Release reservation request */
export interface ReleaseReservationRequest {
  reservationId: string;
  resourceId?: string;
}

/** Force reservation request */
export interface ForceReservationRequest {
  reservationId: string;
  resourceId?: string;
  reason?: string;
}

/** Check reservation conflicts request */
export interface CheckReservationConflictsRequest {
  resourceId: string;
  requestedBy: string;
}
