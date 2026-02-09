// File API types

export interface CheckFileExistsRequest {
  path: string;
}

export interface CheckFileExistsResponse {
  exists: boolean;
  path: string;
}

export interface AddFileRequest {
  path: string;
  content: string;
}

export interface ZipFileRequest {
  files: string[];
  outputPath?: string;
}

export interface DeleteZipRequest {
  path: string;
}
