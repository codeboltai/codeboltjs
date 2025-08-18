/**
 * Utils SDK Function Types
 * Types for the cbutils module functions
 */

// Base response interface for utils operations
export interface BaseUtilsSDKResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

// Utils operation responses
export interface FsEditFileAndApplyDiffResponse extends BaseUtilsSDKResponse {
  filePath?: string;
  diff?: string;
  diffIdentifier?: string;
  prompt?: string;
  applyModel?: string;
  result?: string | {
    status: 'success' | 'error' | 'review_started' | 'rejected';
    file: string;
    message: string;
  };
}
