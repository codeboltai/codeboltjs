export type ArtifactType =
  | 'static_site'
  | 'dynamic_site'
  | 'image'
  | 'video'
  | 'native_application'
  | 'terminal_application'
  | 'url'
  | 'file'
  | 'other';

export type ArtifactStatus = 'created' | 'updated' | 'archived' | 'deleted';

export interface ArtifactFileInput {
  path: string;
  content: string;
  encoding?: 'utf8' | 'base64';
}

export interface ArtifactRuntime {
  command?: string;
  args?: string[];
  cwd?: string;
  port?: number;
  url?: string;
}

export interface Artifact {
  id: string;
  type: ArtifactType;
  status: ArtifactStatus;
  title: string;
  description?: string;
  storagePath: string;
  relativeStoragePath: string;
  entrypoint?: string;
  previewUrl?: string;
  externalUrl?: string;
  externalProvider?: string;
  externalResourceId?: string;
  expiresAt?: string;
  files: string[];
  metadata?: Record<string, unknown>;
  runtime?: ArtifactRuntime;
  agentId?: string;
  agentName?: string;
  agentInstanceId?: string;
  threadId?: string;
  parentAgentInstanceId?: string;
  parentId?: string;
  reviewMergeRequestId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateArtifactInput {
  type: ArtifactType;
  title: string;
  description?: string;
  entrypoint?: string;
  externalUrl?: string;
  externalProvider?: string;
  externalResourceId?: string;
  expiresAt?: string;
  files?: ArtifactFileInput[];
  sourcePath?: string;
  metadata?: Record<string, unknown>;
  runtime?: ArtifactRuntime;
  agentId?: string;
  agentName?: string;
  agentInstanceId?: string;
  threadId?: string;
  parentAgentInstanceId?: string;
  parentId?: string;
  reviewMergeRequestId?: string;
}

export interface ArtifactCreatorParams extends Partial<CreateArtifactInput> {
  artifact?: Partial<CreateArtifactInput> & {
    url?: string;
  };
  url?: string;
}

export interface ActionBlockInvocationMetadata {
  sideExecutionId?: string;
  threadId?: string;
  parentAgentId?: string;
  parentAgentInstanceId?: string;
  timestamp?: string;
}

export interface CreateArtifactResult {
  success: boolean;
  artifactId?: string;
  artifact?: Artifact;
  previewUrl?: string;
  externalUrl?: string;
  files?: string[];
  totalFiles?: number;
  message?: string;
  error?: string;
}
