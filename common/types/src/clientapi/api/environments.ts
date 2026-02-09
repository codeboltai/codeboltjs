// Environments API types

export interface ProviderData {
  id: number;
  unique_id: string;
  name: string;
  author: string;
  description: string;
  tags: string[];
  version: string;
  createdByUser: string;
  providerId?: string;
  providerPath?: string;
  isLocal?: boolean;
  supportsSingleAgentOnly?: boolean;
  runsAnyAgent?: boolean;
  supportedAgentToRun?: string[];
}

export interface Environment {
  id: string;
  name: string;
  description?: string;
  provider: ProviderData;
  config?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
  supportsSingleAgentOnly?: boolean;
  runsAnyAgent?: boolean;
  supportedAgentToRun?: string[];
  state?: string;
}

export type EnvironmentStatus = 'active' | 'inactive' | 'error' | 'provisioning';

export interface InstalledProvider {
  id: string;
  name: string;
  displayName: string;
  type: 'docker' | 'e2b' | 'local' | 'remote' | 'custom';
  description?: string;
  author?: string;
  version?: string;
  tags?: string[];
  apiKey?: string;
  endpoint?: string;
  config?: Record<string, unknown>;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInstalledProviderRequest {
  name: string;
  displayName?: string;
  type: 'docker' | 'e2b' | 'local' | 'remote' | 'custom';
  description?: string;
  author?: string;
  version?: string;
  apiKey?: string;
  endpoint?: string;
  config?: Record<string, unknown>;
}

export interface InstallProviderRequest {
  providerId: string;
  config?: Record<string, unknown>;
}

export interface UpdateInstalledProviderRequest {
  name?: string;
  displayName?: string;
  description?: string;
  apiKey?: string;
  endpoint?: string;
  config?: Record<string, unknown>;
}

export interface CreateEnvironmentRequest {
  name: string;
  description?: string;
  provider: ProviderData;
  config?: Record<string, unknown>;
}

export interface UpdateEnvironmentRequest {
  name?: string;
  description?: string;
  provider?: ProviderData;
  config?: Record<string, unknown>;
  isActive?: boolean;
}

export interface EnvironmentProviderStatus {
  status: EnvironmentStatus;
  message?: string;
}

export interface GetDiffFilesRequest {
  basePath?: string;
  comparePath?: string;
}

export interface ReadEnvironmentFileRequest {
  path: string;
}

export interface WriteEnvironmentFileRequest {
  path: string;
  content: string;
}

export interface MergePatchRequest {
  patch: string;
}

export interface SendPullRequestRequest {
  title: string;
  description?: string;
  branch?: string;
}
