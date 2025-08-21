/**
 * File System SDK Function Types
 * Types for the cbfs module functions
 */

// Base response interface for file system operations
export interface BaseFsSDKResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// File operations
export interface CreateFileResponse extends BaseFsSDKResponse {
  path?: string;
  fileName?: string;
  source?: string;
}

export interface CreateFolderResponse extends BaseFsSDKResponse {
  path?: string;
  folderName?: string;
}

export interface ReadFileResponse extends BaseFsSDKResponse {
  content?: string;
  path?: string;
  encoding?: string;
  result?: string;
}

export interface UpdateFileResponse extends BaseFsSDKResponse {
  path?: string;
  newContent?: string;
  bytesWritten?: number;
}

export interface DeleteFileResponse extends BaseFsSDKResponse {
  path?: string;
  filename?: string;
}

export interface DeleteFolderResponse extends BaseFsSDKResponse {
  path?: string;
  foldername?: string;
}

// File listing and search operations
export interface FileListResponse extends BaseFsSDKResponse {
  files?: string[];
  result?: string;
  isRecursive?: boolean;
}

export interface ListCodeDefinitionsResponse extends BaseFsSDKResponse {
  definitions?: string[];
  result?: string;
}

export interface SearchFilesResponse extends BaseFsSDKResponse {
  query?: string;
  results?: Array<{
    path: string;
    matches: Array<{
      line: number;
      content: string;
      lineNumber: number;
    }>;
  }>;
  result?: string;
  filePattern?: string;
}

export interface WriteToFileResponse extends BaseFsSDKResponse {
  result?: string;
  bytesWritten?: number;
}

export interface GrepSearchResponse extends BaseFsSDKResponse {
  query?: string;
  includePattern?: string;
  excludePattern?: string;
  caseSensitive?: boolean;
  results?: Array<{
    file: string;
    line: number;
    content: string;
    match: string;
  }>;
  result?: string;
}

export interface FileSearchResponse extends BaseFsSDKResponse {
  query?: string;
  results?: string[];
  result?: string;
}

export interface EditFileAndApplyDiffResponse extends BaseFsSDKResponse {
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
