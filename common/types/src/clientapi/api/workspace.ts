// --- Core Entities ---

/** Workspace settings */
export interface WorkspaceSettings {
  name?: string;
  rootPath: string;
  defaultAgent?: string;
  defaultModel?: string;
  defaultProvider?: string;
  gitEnabled?: boolean;
  autoSave?: boolean;
  theme?: string;
  metadata?: Record<string, unknown>;
}

/** Workspace */
export interface Workspace {
  id: string;
  name: string;
  rootPath: string;
  settings?: WorkspaceSettings;
  projectPaths?: string[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** Workspace project info */
export interface WorkspaceProject {
  id: string;
  name: string;
  path: string;
  isActive?: boolean;
}

// --- Request Types ---

/** Select workspace request */
export interface SelectWorkspaceRequest {
  workspaceId: string;
}

/** Create workspace request */
export interface CreateWorkspaceRequest {
  name: string;
  rootPath: string;
  settings?: Partial<WorkspaceSettings>;
}

/** Update workspace request */
export interface UpdateWorkspaceRequest {
  name?: string;
  rootPath?: string;
  settings?: Partial<WorkspaceSettings>;
  isActive?: boolean;
}
