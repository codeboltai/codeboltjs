// --- Core Entities ---

/** User info */
export interface User {
  id: string;
  username?: string;
  email?: string;
  displayName?: string;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}

/** Saved messages */
export interface SavedMessages {
  agentId: string;
  messages: unknown[];
  metadata?: Record<string, unknown>;
}

// --- Request Types ---

/** Check if user exists locally request */
export interface CheckUserExistsRequest {
  email?: string;
  username?: string;
  userId?: string;
}

/** Create user request */
export interface CreateUserRequest {
  username?: string;
  email?: string;
  displayName?: string;
  password?: string;
  metadata?: Record<string, unknown>;
}

/** Logout request */
export interface LogoutRequest {
  userId?: string;
  clearSession?: boolean;
}

/** Save messages request */
export interface SaveMessagesRequest {
  messages: unknown[];
  metadata?: Record<string, unknown>;
}

/** Get messages params */
export interface GetMessagesParams {
  agentId?: string;
  threadId?: string;
  limit?: number;
  offset?: number;
}
