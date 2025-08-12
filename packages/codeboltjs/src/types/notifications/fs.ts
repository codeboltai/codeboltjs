// ===== FILE SYSTEM NOTIFICATIONS =====

// Request Notifications
export type FileCreateRequestNotification = {
    toolUseId: string;
    type: "fsnotify";
    action: "createFileRequest";
    data: {
        fileName: string;
        source: string;
        filePath: string;
    };
};

export type FileCreateResponseNotification = {
    toolUseId: string;
    type: "fsnotify";
    action: "createFileResult";
    content: string | any;
    isError?: boolean;
}

export type FolderCreateRequestNotification = {
    toolUseId: string;
    type: "fsnotify";
    action: "createFolderRequest";
    data: {
        folderName: string;
        folderPath: string;
    };
};

export type FolderCreateResponseNotification = {
    toolUseId: string;
    type: "fsnotify";
    action: "createFolderResult";
    content: string | any;
    isError?: boolean;
};

export type FileReadRequestNotification = {
    toolUseId: string;
    type: "fsnotify";
    action: "readFileRequest";
    data: {
        filePath: string;
        startLine?: string;
        endLine?: string;
    };
};

export type FileReadResponseNotification = {
    toolUseId: string;
    type: "fsnotify";
    action: "readFileResult";
    content: string | any;
    isError?: boolean;
};

export type FileEditRequestNotification = {
    toolUseId: string;
    type: "fsnotify";
    action: "updateFileRequest";
    data: {
        fileName: string;
        filePath: string;
        newContent: string;
    };
};

export type FileEditResponseNotification = {
    toolUseId: string;
    type: "fsnotify";
    action: "updateFileResult";
    content: string | any;
    isError?: boolean;
};

export type FileDeleteRequestNotification = {
    toolUseId: string;
    type: "fsnotify";
    action: "deleteFileRequest";
    data: {
        fileName: string;
        filePath: string;
    };
};

export type FileDeleteResponseNotification = {
    toolUseId: string;
    type: "fsnotify";
    action: "deleteFileResult";
    content: string | any;
    isError?: boolean;
};

export type FolderDeleteRequestNotification = {
    toolUseId: string;
    type: "fsnotify";
    action: "deleteFolderRequest";
    data: {
        folderName: string;
        folderPath: string;
    };
};

export type FolderDeleteResponseNotification = {
    toolUseId: string;
    type: "fsnotify";
    action: "deleteFolderResult";
    content: string | any;
    isError?: boolean;
};

export type ListDirectoryRequestNotification = {
    toolUseId: string;
    type: "fsnotify";
    action: "listDirectoryRequest";
    data: {
        dirPath: string;
    };
};

export type ListDirectoryResponseNotification = {
    toolUseId: string;
    type: "fsnotify";
    action: "listDirectoryResult";
    content: string | any;
    isError?: boolean;
};

export type WriteToFileRequestNotification = {
    toolUseId: string;
    type: "fsnotify";
    action: "writeToFileRequest";
    data: {
        filePath: string;
        text: string;
    };
};

export type WriteToFileResponseNotification = {
    toolUseId: string;
    type: "fsnotify";
    action: "writeToFileResult";
    content: string | any;
    isError?: boolean;
};

export type AppendToFileRequestNotification = {
    toolUseId: string;
    type: "fsnotify";
    action: "appendToFileRequest";
    data: {
        filePath: string;
        text: string;
    };
};

export type AppendToFileResponseNotification = {
    toolUseId: string;
    type: "fsnotify";
    action: "appendToFileResult";
    content: string | any;
    isError?: boolean;
};

export type CopyFileRequestNotification = {
    toolUseId: string;
    type: "fsnotify";
    action: "copyFileRequest";
    data: {
        sourceFile: string;
        destinationFile: string;
    };
};

export type CopyFileResponseNotification = {
    toolUseId: string;
    type: "fsnotify";
    action: "copyFileResult";
    content: string | any;
    isError?: boolean;
};

export type MoveFileRequestNotification = {
    toolUseId: string;
    type: "fsnotify";
    action: "moveFileRequest";
    data: {
        sourceFile: string;
        destinationFile: string;
    };
};

export type MoveFileResponseNotification = {
    toolUseId: string;
    type: "fsnotify";
    action: "moveFileResult";
    content: string | any;
    isError?: boolean;
};

// Union Types for Convenience
export type FileSystemRequestNotification = 
    | FileCreateRequestNotification
    | FolderCreateRequestNotification
    | FileReadRequestNotification
    | FileEditRequestNotification
    | FileDeleteRequestNotification
    | FolderDeleteRequestNotification
    | ListDirectoryRequestNotification
    | WriteToFileRequestNotification
    | AppendToFileRequestNotification
    | CopyFileRequestNotification
    | MoveFileRequestNotification;

export type FileSystemResponseNotification = 
    | FileCreateResponseNotification
    | FolderCreateResponseNotification
    | FileReadResponseNotification
    | FileEditResponseNotification
    | FileDeleteResponseNotification
    | FolderDeleteResponseNotification
    | ListDirectoryResponseNotification
    | WriteToFileResponseNotification
    | AppendToFileResponseNotification
    | CopyFileResponseNotification
    | MoveFileResponseNotification; 