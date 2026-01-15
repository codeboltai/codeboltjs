// Codemap Types for codeboltjs

// Status of a codemap
export type CodemapStatus = 'creating' | 'done' | 'error';

// Section in a codemap
export interface CodemapSection {
    id: string;
    title: string;
    description?: string;
    files?: string[];
    subsections?: CodemapSection[];
}

// Complete codemap structure
export interface Codemap {
    id: string;
    title: string;
    description?: string;
    query?: string;
    sections: CodemapSection[];
    createdAt: string;
    updatedAt: string;
}

// Codemap info (lightweight metadata)
export interface CodemapInfo {
    id: string;
    title: string;
    description?: string;
    query?: string;
    status: CodemapStatus;
    error?: string;
    createdAt: string;
    updatedAt: string;
}

// Input types

export interface CreateCodemapData {
    title: string;
    query?: string;
}

export interface SaveCodemapData {
    codemap: Codemap;
}

export interface UpdateCodemapStatusData {
    status: CodemapStatus;
    error?: string;
}

export interface UpdateCodemapData {
    title?: string;
    description?: string;
    status?: CodemapStatus;
    error?: string;
}

// Response types

export interface CodemapListResponse {
    codemaps: CodemapInfo[];
    count: number;
}

export interface CodemapGetResponse {
    codemap: Codemap | CodemapInfo;
}

export interface CodemapCreateResponse {
    codemap: CodemapInfo;
}

export interface CodemapSaveResponse {
    codemap: CodemapInfo;
}

export interface CodemapUpdateResponse {
    codemap: CodemapInfo;
}

export interface CodemapDeleteResponse {
    success: boolean;
}
