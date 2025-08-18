/**
 * State SDK Function Types
 * Types for the cbstate module functions
 */

// Base response interface for state operations
export interface BaseStateSDKResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

// State operation responses
export interface GetAppStateResponse extends BaseStateSDKResponse {
  state?: Record<string, any>;
}

export interface UpdateProjectStateResponse extends BaseStateSDKResponse {
  state?: Record<string, any>;
}

export interface GetAgentStateResponse extends BaseStateSDKResponse {
  payload?: Record<string, any>;
}

export interface AddToAgentStateResponse extends BaseStateSDKResponse {
  payload?: { success: boolean };
}

export interface GetProjectStateResponse extends BaseStateSDKResponse {
  projectState?: Record<string, any>;
  data?: Record<string, any>;
}
