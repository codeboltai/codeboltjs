/**
 * Project SDK Function Types
 * Types for the cbproject module functions
 */

// Base response interface for project operations
export interface BaseProjectSDKResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

// Project operation responses
export interface GetProjectPathResponse extends BaseProjectSDKResponse {
  projectPath?: string;
  projectName?: string;
}

export interface GetProjectSettingsResponse extends BaseProjectSDKResponse {
  projectSettings?: Record<string, any>;
  data?: Record<string, any>;
}

export interface GetRepoMapResponse extends BaseProjectSDKResponse {
  repoMap?: any;
}
