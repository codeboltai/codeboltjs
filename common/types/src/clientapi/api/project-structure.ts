// --- Core Entities ---

/** Package section item */
export interface PackageSectionItem {
  id: string;
  name: string;
  type?: string;
  data?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/** Package definition */
export interface PackageDefinition {
  id: string;
  name: string;
  description?: string;
  version?: string;
  sections?: Record<string, PackageSectionItem[]>;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

/** Workspace metadata */
export interface WorkspaceMetadata {
  packages: PackageDefinition[];
  metadata?: Record<string, unknown>;
}

// --- Request Types ---

/** Save workspace metadata request */
export interface SaveWorkspaceMetadataRequest {
  packages?: PackageDefinition[];
  metadata?: Record<string, unknown>;
}

/** Create package request */
export interface CreatePackageRequest {
  name: string;
  description?: string;
  version?: string;
  sections?: Record<string, PackageSectionItem[]>;
  metadata?: Record<string, unknown>;
}

/** Update package request */
export interface UpdatePackageRequest {
  name?: string;
  description?: string;
  version?: string;
  sections?: Record<string, PackageSectionItem[]>;
  metadata?: Record<string, unknown>;
}

/** Add item to section request */
export interface AddSectionItemRequest {
  name: string;
  type?: string;
  data?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}
