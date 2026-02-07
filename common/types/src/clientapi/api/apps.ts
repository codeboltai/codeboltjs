// Apps API types

export interface App {
  id: string;
  name: string;
  description?: string;
  version?: string;
  author?: string;
  installed?: boolean;
  running?: boolean;
  config?: Record<string, unknown>;
}

export interface InstallAppRequest {
  appId: string;
  source?: string;
  config?: Record<string, unknown>;
}

export interface StartAppRequest {
  appId: string;
  config?: Record<string, unknown>;
}

export interface ForkAppRequest {
  appId: string;
  name?: string;
}

export interface EditAppRequest {
  appId: string;
  changes: Record<string, unknown>;
}

export interface UninstallAppRequest {
  appId: string;
}

export interface AppCacheParams {
  appId?: string;
}
