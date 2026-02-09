// --- Core Entities ---

/** User profile */
export interface UserProfile {
  id?: string;
  username?: string;
  email?: string;
  displayName?: string;
  defaultAgent?: string;
  defaultModel?: string;
  preferences?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

// --- Request Types ---

/** Set default agent request */
export interface SetDefaultAgentRequest {
  agentId?: string;
  agentName?: string;
}
