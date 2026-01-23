/**
 * File System SDK Function Types
 * Types for the cbfs module functions
 */

// Base response interface for file system operations
export interface BaseFsSDKResponse {
  success: boolean;
  message?: string;
  error?: string | any;
}

// File operations
export interface CreateFileResponse extends BaseFsSDKResponse {
  path?: string;
  created?: boolean;
  bytesWritten?: number;
  stats?: any;
}

export interface CreateFolderResponse extends BaseFsSDKResponse {
  path?: string;
  created?: boolean;
  stats?: any;
}

export interface ReadFileResponse extends BaseFsSDKResponse {
  content?: string;
  path?: string;
  encoding?: string;
  size?: number;
  stats?: any;
  lineCount?: number;
  truncated?: boolean;
}

export interface UpdateFileResponse extends BaseFsSDKResponse {
  path?: string;
  updated?: boolean;
  bytesWritten?: number;
  backupPath?: string;
  stats?: any;
  changeSummary?: {
    linesAdded: number;
    linesRemoved: number;
    linesModified: number;
  };
}

export interface DeleteFileResponse extends BaseFsSDKResponse {
  path?: string;
  deleted?: boolean;
  moveToTrash?: boolean;
  trashLocation?: string;
  recoveredFromBackup?: string;
}

export interface DeleteFolderResponse extends BaseFsSDKResponse {
  path?: string;
  deleted?: boolean;
  itemsDeleted?: number;
  moveToTrash?: boolean;
  trashLocation?: string;
}

// File listing and search operations
export interface FileListResponse extends BaseFsSDKResponse {
  files?: string[];
  path?: string;
  totalCount?: number;
  hasMore?: boolean;
  recursive?: boolean;
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
      startIndex?: number;
      endIndex?: number;
    }>;
    stats?: any;
  }>;
  totalCount?: number;
  hasMore?: boolean;
  searchTime?: number;
  path?: string;
}

export interface WriteToFileResponse extends BaseFsSDKResponse {
  result?: string;
  bytesWritten?: number;
}

export interface GrepSearchResponse extends BaseFsSDKResponse {
  pattern?: string;
  results?: Array<{
    path: string;
    matches: Array<{
      line: number;
      content: string;
      lineNumber: number;
    }>;
    stats?: any;
  }>;
  totalCount?: number;
  hasMore?: boolean;
  searchTime?: number;
  path?: string;
  includePattern?: string;
  excludePattern?: string;
}

export interface FileSearchResponse extends BaseFsSDKResponse {
  query?: string;
  results?: string[]; // Note: fileSearch (fuzzy) usually returns paths? Checking legacy support.
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

// Result of readManyFiles operation
export interface ReadManyFilesResponse extends BaseFsSDKResponse {
  results?: Array<{
    path: string;
    content?: string;
    error?: any;
    stats?: any;
  }>;
  summary?: {
    total: number;
    successful: number;
    failed: number;
  };
}

// Directory entry information for listDirectory
export interface DirectoryEntry {
  name: string;
  path: string;
  type: 'file' | 'directory' | 'symlink' | 'other';
  size?: number;
  permissions?: string;
  modifiedTime?: Date;
  isHidden?: boolean;
}

export interface ListDirectoryResponse extends BaseFsSDKResponse {
  path?: string;
  entries?: DirectoryEntry[];
  totalCount?: number;
  hasMore?: boolean;
  stats?: {
    totalSize: number;
    fileCount: number;
    directoryCount: number;
  };
}

