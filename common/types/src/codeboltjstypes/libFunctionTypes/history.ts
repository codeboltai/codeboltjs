/**
 * History SDK Function Types
 * Types for the cbhistory module functions
 */

// Base response interface for history operations
export interface BaseHistorySDKResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

// History operation responses
export interface GetSummarizeAllResponse extends BaseHistorySDKResponse {
  payload?: string;
  summary?: string;
}

export interface GetSummarizeResponse extends BaseHistorySDKResponse {
  payload?: string;
  summary?: string;
  depth?: number;
}
