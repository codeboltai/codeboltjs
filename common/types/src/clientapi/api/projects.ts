// --- Core Entities ---

/** Project settings */
export interface ProjectSettings {
  name?: string;
  description?: string;
  language?: string;
  framework?: string;
  buildCommand?: string;
  testCommand?: string;
  startCommand?: string;
  metadata?: Record<string, unknown>;
}

/** Project */
export interface Project {
  id: string;
  name: string;
  path: string;
  description?: string;
  settings?: ProjectSettings;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
  agentIds?: string[];
  metadata?: Record<string, unknown>;
}

/** Project config */
export interface ProjectConfig {
  [key: string]: unknown;
}

/** Task group */
export interface TaskGroup {
  id: string;
  name: string;
  description?: string;
  projectPath?: string;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}

/** Thread group mapping */
export interface ThreadGroupMapping {
  threadId: string;
  groupId: string;
}

/** Tree item */
export interface TreeItem {
  id: string;
  name: string;
  type: string;
  parentId?: string;
  children?: TreeItem[];
  metadata?: Record<string, unknown>;
}

// --- Request Types ---

/** Create project request */
export interface CreateProjectRequest {
  name: string;
  path: string;
  description?: string;
  settings?: ProjectSettings;
}

/** Update project request */
export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  settings?: Partial<ProjectSettings>;
  isActive?: boolean;
}

/** Get all projects with unique ID request */
export interface GetAllProjectsRequest {
  workspaceId?: string;
  filter?: Record<string, unknown>;
}

/** Update project config request */
export interface UpdateProjectConfigRequest {
  [key: string]: unknown;
}

/** Update codebolt yaml request */
export interface UpdateCodeboltYamlRequest {
  [key: string]: unknown;
}

/** Set active project request */
export interface SetActiveProjectRequest {
  projectPath?: string;
  projectId?: string;
}

/** Run command request */
export interface RunCommandRequest {
  command: string;
  cwd?: string;
}

/** Check environment request */
export interface CheckEnvironmentRequest {
  [key: string]: unknown;
}

/** Check project name request */
export interface CheckProjectNameRequest {
  name: string;
}

/** Reset project request */
export interface ResetProjectRequest {
  projectPath?: string;
  projectId?: string;
}

/** Batch tree items request */
export interface BatchTreeItemsRequest {
  itemIds: string[];
}

/** Create task group request */
export interface CreateTaskGroupRequest {
  name: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

/** Update task group request */
export interface UpdateTaskGroupRequest {
  name?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

/** Assign thread to group request */
export interface AssignThreadToGroupRequest {
  threadId: string;
  groupId: string;
}
