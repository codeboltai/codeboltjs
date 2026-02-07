// --- Core Entities ---

/** CLI status */
export interface CliStatus {
  installed: boolean;
  version?: string;
  path?: string;
}

// --- Request Types ---

/** Install CLI request */
export interface InstallCliRequest {
  force?: boolean;
}

/** Open folder request */
export interface OpenFolderRequest {
  path: string;
}

// --- Response Types ---

/** Install CLI response */
export interface InstallCliResponse {
  success: boolean;
  message?: string;
  path?: string;
}

/** Open folder response */
export interface OpenFolderResponse {
  success: boolean;
  message?: string;
}
