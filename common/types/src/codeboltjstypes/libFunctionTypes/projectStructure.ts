/**
 * Project Structure Types
 * Type definitions for project structure management
 */

// HTTP method type
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

// API Route definition
export interface ApiRoute {
    id: string;
    path: string;
    method: HttpMethod;
    description?: string;
    handler?: string;
    file?: string;
    auth?: boolean;
    tags?: string[];
}

// Database table column
export interface DatabaseColumn {
    name: string;
    type: string;
    nullable?: boolean;
    primaryKey?: boolean;
    foreignKey?: string;
    defaultValue?: string;
}

// Database table definition
export interface DatabaseTable {
    id: string;
    name: string;
    description?: string;
    columns: DatabaseColumn[];
    indexes?: string[];
}

// Dependency definition
export interface Dependency {
    id: string;
    name: string;
    version: string;
    type: 'runtime' | 'dev' | 'peer' | 'optional';
    description?: string;
}

// Run command definition
export interface RunCommand {
    id: string;
    name: string;
    command: string;
    description?: string;
    cwd?: string;
}

// UI Route definition
export interface UiRoute {
    id: string;
    path: string;
    component?: string;
    file?: string;
    description?: string;
    auth?: boolean;
    layout?: string;
}

// Deployment configuration
export interface DeploymentConfig {
    id: string;
    name: string;
    type: 'docker' | 'kubernetes' | 'serverless' | 'static' | 'custom';
    description?: string;
    config?: Record<string, any>;
}

// Git information
export interface GitInfo {
    repository?: string;
    branch?: string;
    remote?: string;
    mainBranch?: string;
}

// Design guidelines
export interface DesignGuidelines {
    colors?: Record<string, string>;
    fonts?: string[];
    spacing?: Record<string, string>;
    components?: string[];
    customGuidelines?: string;
}

// Framework information
export interface FrameworkInfo {
    name: string;
    version?: string;
    description?: string;
    config?: Record<string, any>;
}

// Package metadata
export interface PackageMetadata {
    id: string;
    name: string;
    path: string;
    description?: string;
    type?: 'frontend' | 'backend' | 'shared' | 'library' | 'service';
    apiRoutes?: ApiRoute[];
    uiRoutes?: UiRoute[];
    database?: DatabaseTable[];
    dependencies?: Dependency[];
    runCommands?: RunCommand[];
    deploymentConfigs?: DeploymentConfig[];
    designGuidelines?: DesignGuidelines;
    frontendFramework?: FrameworkInfo;
}

// Workspace metadata
export interface WorkspaceMetadata {
    name?: string;
    description?: string;
    version?: string;
    gitInfo?: GitInfo;
    packages: PackageMetadata[];
    createdAt?: string;
    updatedAt?: string;
}

// Input types

export interface CreatePackageData {
    name: string;
    path: string;
    description?: string;
    type?: 'frontend' | 'backend' | 'shared' | 'library' | 'service';
}

export interface UpdatePackageData {
    name?: string;
    description?: string;
    type?: 'frontend' | 'backend' | 'shared' | 'library' | 'service';
}

// Response types

export interface ProjectStructureMetadataResponse {
    metadata: WorkspaceMetadata;
}

export interface ProjectStructurePackagesResponse {
    packages: PackageMetadata[];
    count: number;
}

export interface ProjectStructurePackageResponse {
    package: PackageMetadata;
}

export interface ProjectStructureDeleteResponse {
    success: boolean;
}

export interface ProjectStructureItemResponse {
    item: any;
}

export interface ProjectStructureUpdateResponse {
    success: boolean;
    data?: any;
}
