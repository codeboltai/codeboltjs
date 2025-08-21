export type GrepSearchRequestNotification = {
    toolUseId: string;
    type: "codeutilsnotify";
    action: "grepSearchRequest";
    data: {
        pattern: string;
        filePath?: string;
        recursive?: boolean;
        ignoreCase?: boolean;
        maxResults?: number;
    };
};
export type GrepSearchResponseNotification = {
    toolUseId: string;
    type: "codeutilsnotify";
    action: "grepSearchResult";
    content: string | any;
    isError?: boolean;
    data?: {
        matches: Array<{
            file: string;
            line: number;
            content: string;
            matchIndex?: number;
        }>;
        totalMatches?: number;
    };
};
export type GlobSearchRequestNotification = {
    toolUseId: string;
    type: "codeutilsnotify";
    action: "globSearchRequest";
    data: {
        pattern: string;
        basePath?: string;
        maxDepth?: number;
        includeDirectories?: boolean;
    };
};
export type GlobSearchResponseNotification = {
    toolUseId: string;
    type: "codeutilsnotify";
    action: "globSearchResult";
    content: string | any;
    isError?: boolean;
    data?: {
        files: Array<{
            path: string;
            type: 'file' | 'directory';
            size?: number;
            modified?: string;
        }>;
        totalFiles?: number;
    };
};
