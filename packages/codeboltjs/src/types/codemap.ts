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
    description?: string;
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

// Response types - follow cliLib pattern: { success, code, message, data, error }

export interface CodemapBaseResponse {
    success: boolean;
    code?: string;
    message?: string;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
}

export interface CodemapListResponse extends CodemapBaseResponse {
    data?: {
        codemaps: CodemapInfo[];
        count: number;
    };
}

export interface CodemapGetResponse extends CodemapBaseResponse {
    data?: {
        codemap: Codemap | CodemapInfo;
    };
}

export interface CodemapCreateResponse extends CodemapBaseResponse {
    data?: {
        codemap: CodemapInfo;
    };
}

export interface CodemapSaveResponse extends CodemapBaseResponse {
    data?: {
        codemap: CodemapInfo;
    };
}

export interface CodemapUpdateResponse extends CodemapBaseResponse {
    data?: {
        codemap: CodemapInfo;
    };
}

export interface CodemapDeleteResponse extends CodemapBaseResponse {
    // No data on delete, just success/error
}
