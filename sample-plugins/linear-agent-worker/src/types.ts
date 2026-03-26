// ---------------------------------------------------------------------------
// Cloudflare Worker environment bindings
// ---------------------------------------------------------------------------

export interface Env {
  LINEAR_AGENT_HUB: DurableObjectNamespace;
  OAUTH_TOKENS: KVNamespace;
  LINEAR_CLIENT_ID: string;
  LINEAR_CLIENT_SECRET: string;
  LINEAR_WEBHOOK_SECRET: string;
  WORKER_URL: string;
  ENVIRONMENT: string;
}

// ---------------------------------------------------------------------------
// WebSocket message protocol (CodeBolt App ↔ Durable Object)
// ---------------------------------------------------------------------------

/** App → DO: register this connection */
export interface RegisterMessage {
  type: 'register';
  appToken: string;
}

/** DO → App: new agent session created */
export interface SessionCreatedMessage {
  type: 'session:created';
  sessionId: string;
  session: AgentSessionPayload;
}

/** DO → App: user sent a follow-up prompt */
export interface SessionPromptedMessage {
  type: 'session:prompted';
  sessionId: string;
  message: string;
  agentActivityId?: string;
}

/** App → DO: emit an activity to Linear */
export interface ActivityMessage {
  type: 'activity';
  sessionId: string;
  activity: AgentActivityContent;
}

/** App → DO: update session state */
export interface SessionStateMessage {
  type: 'session:state';
  sessionId: string;
  state: AgentSessionState;
}

/** App → DO: update session plan */
export interface PlanUpdateMessage {
  type: 'plan:update';
  sessionId: string;
  steps: AgentPlanStep[];
}

/** App → DO: update external URLs on session */
export interface ExternalUrlMessage {
  type: 'session:external-url';
  sessionId: string;
  urls: Array<{ label: string; url: string }>;
}

/** DO → App: registration acknowledgment */
export interface RegisteredAckMessage {
  type: 'registered';
  appToken: string;
  success: boolean;
}

/** DO → App: error notification */
export interface ErrorMessage {
  type: 'error';
  error: string;
  sessionId?: string;
}

/** Ping/Pong for keepalive */
export interface PingMessage {
  type: 'ping';
  timestamp: number;
}

export interface PongMessage {
  type: 'pong';
  timestamp: number;
}

export type AppToHubMessage =
  | RegisterMessage
  | ActivityMessage
  | SessionStateMessage
  | PlanUpdateMessage
  | ExternalUrlMessage
  | PingMessage;

export type HubToAppMessage =
  | RegisteredAckMessage
  | SessionCreatedMessage
  | SessionPromptedMessage
  | ErrorMessage
  | PongMessage;

// ---------------------------------------------------------------------------
// Linear Agent types
// ---------------------------------------------------------------------------

export type AgentSessionState =
  | 'pending'
  | 'active'
  | 'complete'
  | 'error'
  | 'awaitingInput'
  | 'stale';

export type AgentActivityType =
  | 'thought'
  | 'action'
  | 'response'
  | 'error'
  | 'elicitation';

export interface AgentPlanStep {
  content: string;
  status: 'pending' | 'inProgress' | 'completed' | 'canceled';
}

/** Thought activity content */
export interface ThoughtContent {
  type: 'thought';
  body: string;
}

/** Elicitation activity content */
export interface ElicitationContent {
  type: 'elicitation';
  body: string;
}

/** Action activity content (with optional result) */
export interface ActionContent {
  type: 'action';
  action: string;
  parameter: string;
  result?: string;
}

/** Response activity content */
export interface ResponseContent {
  type: 'response';
  body: string;
}

/** Error activity content */
export interface ErrorActivityContent {
  type: 'error';
  body: string;
}

export type AgentActivityContent =
  | ThoughtContent
  | ElicitationContent
  | ActionContent
  | ResponseContent
  | ErrorActivityContent;

/** Simplified agent session payload sent to apps */
export interface AgentSessionPayload {
  id: string;
  state: AgentSessionState;
  promptContext: string;
  issueId?: string;
  issue?: {
    id: string;
    identifier: string;
    title: string;
    description?: string;
    url: string;
    project?: { name: string };
    team?: { name: string; key: string };
    labels?: Array<{ name: string }>;
    priority?: number;
    state?: { name: string };
  };
  plan?: AgentPlanStep[];
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Linear webhook payload types
// ---------------------------------------------------------------------------

export interface AgentSessionWebhookPayload {
  action: 'created' | 'prompted';
  type: 'AgentSession';
  organizationId: string;
  agentSession: AgentSessionPayload;
  /** Present when action === 'prompted' */
  agentActivity?: {
    id: string;
    body: string;
    type: 'prompt';
  };
  /** Prompt context (formatted XML string) */
  promptContext?: string;
  /** Previous comments for context */
  previousComments?: Array<{
    id: string;
    body: string;
    userId?: string;
  }>;
  /** Workspace guidance rules */
  guidance?: Array<{
    origin: string;
    teamName?: string;
    content: string;
  }>;
}

// ---------------------------------------------------------------------------
// Internal DO ↔ Worker messages (HTTP body for webhook forwarding)
// ---------------------------------------------------------------------------

export interface WebhookForwardPayload {
  type: 'webhook';
  organizationId: string;
  accessToken: string;
  event: AgentSessionWebhookPayload;
}
