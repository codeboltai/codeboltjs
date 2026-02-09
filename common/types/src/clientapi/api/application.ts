// --- Core Entities ---

/** Application state */
export interface AppState {
  projectPath?: string;
  activeThreadId?: string;
  activeAgentId?: string;
  theme?: string;
  layout?: string;
  metadata?: Record<string, unknown>;
}

/** Root application state */
export interface RootAppState {
  workspaceId?: string;
  projectPath?: string;
  version?: string;
  metadata?: Record<string, unknown>;
}

/** Pinned agent info */
export interface PinnedAgent {
  agentId: string;
  agentName?: string;
  pinnedAt?: string;
}

/** Tree view state */
export interface TreeViewState {
  expandedNodes?: string[];
  selectedNode?: string;
  scrollPosition?: number;
  metadata?: Record<string, unknown>;
}

/** Mode layout configuration */
export interface ModeLayout {
  mode: string;
  layout: Record<string, unknown>;
}

/** App state layout */
export interface AppStateLayout {
  layouts: Record<string, Record<string, unknown>>;
  currentLayout?: string;
}

/** Current layout */
export interface CurrentLayout {
  name: string;
  config: Record<string, unknown>;
}

/** Environment and services info */
export interface EnvAndServices {
  environment: Record<string, unknown>;
  services: Record<string, unknown>;
}

/** Thread token */
export interface ThreadToken {
  token: string;
  threadId?: string;
  expiresAt?: string;
}

// --- Request Types ---

/** Update app state request */
export interface UpdateAppStateRequest {
  projectPath?: string;
  activeThreadId?: string;
  activeAgentId?: string;
  theme?: string;
  layout?: string;
  metadata?: Record<string, unknown>;
}

/** Set pinned agent request */
export interface SetPinnedAgentRequest {
  agentId: string;
  agentName?: string;
}

/** Unpin agent request */
export interface UnpinAgentRequest {
  agentId?: string;
}

/** Save tree view request */
export interface SaveTreeViewRequest {
  expandedNodes?: string[];
  selectedNode?: string;
  scrollPosition?: number;
  metadata?: Record<string, unknown>;
}

/** Set mode layout request */
export interface SetModeLayoutRequest {
  mode: string;
  layout: Record<string, unknown>;
}

/** Set current layout request */
export interface SetCurrentLayoutRequest {
  name: string;
  config: Record<string, unknown>;
}

/** Update root app state request */
export interface UpdateRootAppStateRequest {
  workspaceId?: string;
  projectPath?: string;
  metadata?: Record<string, unknown>;
}

/** Stop all process request */
export interface StopAllProcessRequest {
  force?: boolean;
}
