/**
 * Interface for file system notification functions
 */
export interface FsNotifications {
    FileCreateRequestNotify(fileName: string, source: string, filePath: string, toolUseId?: string): void;
    FileCreateResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
    FolderCreateRequestNotify(folderName: string, folderPath: string, toolUseId?: string): void;
    FolderCreateResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
    FileReadRequestNotify(filePath: string, startLine?: string, endLine?: string, toolUseId?: string): void;
    FileReadResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
    FileEditRequestNotify(fileName: string, filePath: string, newContent: string, toolUseId?: string): void;
    FileEditResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
    FileDeleteRequestNotify(fileName: string, filePath: string, toolUseId?: string): void;
    FileDeleteResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
    FolderDeleteRequestNotify(folderName: string, folderPath: string, toolUseId?: string): void;
    FolderDeleteResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
    ListDirectoryRequestNotify(dirPath: string, toolUseId?: string): void;
    ListDirectoryResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
    WriteToFileRequestNotify(filePath: string, text: string, toolUseId?: string): void;
    WriteToFileResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
    AppendToFileRequestNotify(filePath: string, text: string, toolUseId?: string): void;
    AppendToFileResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
    CopyFileRequestNotify(sourceFile: string, destinationFile: string, toolUseId?: string): void;
    CopyFileResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
    MoveFileRequestNotify(sourceFile: string, destinationFile: string, toolUseId?: string): void;
    MoveFileResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
}