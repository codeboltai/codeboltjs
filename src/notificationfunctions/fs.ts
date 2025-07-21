/**
 * File System Notification Functions
 * 
 * This module provides functions for sending file system-related notifications,
 * including file and folder operations like create, read, edit, delete, etc.
 */

import {
    FileCreateRequestNotification,
    FileCreateResponseNotification,
    FolderCreateRequestNotification,
    FolderCreateResponseNotification,
    FileReadRequestNotification,
    FileReadResponseNotification,
    FileEditRequestNotification,
    FileEditResponseNotification,
    FileDeleteRequestNotification,
    FileDeleteResponseNotification,
    FolderDeleteRequestNotification,
    FolderDeleteResponseNotification,
    ListDirectoryRequestNotification,
    ListDirectoryResponseNotification,
    WriteToFileRequestNotification,
    WriteToFileResponseNotification,
    AppendToFileRequestNotification,
    AppendToFileResponseNotification,
    CopyFileRequestNotification,
    CopyFileResponseNotification,
    MoveFileRequestNotification,
    MoveFileResponseNotification
} from '../types/notifications/fs';

import {
    sendNotification,
    generateToolUseId,
    validateRequiredFields
} from './utils';

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

/**
 * Sends a request to create a file
 * Requirements: 7.1
 */
export function FileCreateRequestNotify(
    fileName: string,
    source: string,
    filePath: string,
    toolUseId?: string
): void {
    if (!validateRequiredFields({ fileName, source, filePath }, ['fileName', 'source', 'filePath'], 'fs.FileCreateRequestNotify')) {
        return;
    }

    const notification: FileCreateRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: "fsnotify",
        action: "createFileRequest",
        data: {
            fileName: fileName,
            source: source,
            filePath: filePath
        }
    };

    sendNotification(notification, 'fs.FileCreateRequestNotify');
}

/**
 * Sends a response to a file creation request
 * Requirements: 7.2
 */
export function FileCreateResponseNotify(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for fs.FileCreateResponseNotify');
        return;
    }

    const notification: FileCreateResponseNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: "fsnotify",
        action: "createFileResult",
        content: content,
        isError: isError
    };

    sendNotification(notification, 'fs.FileCreateResponseNotify');
}

/**
 * Sends a request to create a folder
 * Requirements: 7.3
 */
export function FolderCreateRequestNotify(
    folderName: string,
    folderPath: string,
    toolUseId?: string
): void {
    if (!validateRequiredFields({ folderName, folderPath }, ['folderName', 'folderPath'], 'fs.FolderCreateRequestNotify')) {
        return;
    }

    const notification: FolderCreateRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: "fsnotify",
        action: "createFolderRequest",
        data: {
            folderName: folderName,
            folderPath: folderPath
        }
    };

    sendNotification(notification, 'fs.FolderCreateRequestNotify');
}

/**
 * Sends a response to a folder creation request
 * Requirements: 7.4
 */
export function FolderCreateResponseNotify(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for fs.FolderCreateResponseNotify');
        return;
    }

    const notification: FolderCreateResponseNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: "fsnotify",
        action: "createFolderResult",
        content: content,
        isError: isError
    };

    sendNotification(notification, 'fs.FolderCreateResponseNotify');
}

/**
 * Sends a request to read a file
 * Requirements: 7.4
 */
export function FileReadRequestNotify(
    filePath: string,
    startLine?: string,
    endLine?: string,
    toolUseId?: string
): void {
    if (!validateRequiredFields({ filePath }, ['filePath'], 'fs.FileReadRequestNotify')) {
        return;
    }

    const notification: FileReadRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: "fsnotify",
        action: "readFileRequest",
        data: {
            filePath: filePath,
            startLine: startLine,
            endLine: endLine
        }
    };

    sendNotification(notification, 'fs.FileReadRequestNotify');
}

/**
 * Sends a response to a file read request
 * Requirements: 7.4
 */
export function FileReadResponseNotify(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for fs.FileReadResponseNotify');
        return;
    }

    const notification: FileReadResponseNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: "fsnotify",
        action: "readFileResult",
        content: content,
        isError: isError
    };

    sendNotification(notification, 'fs.FileReadResponseNotify');
}

/**
 * Sends a request to edit a file
 * Requirements: 7.5
 */
export function FileEditRequestNotify(
    fileName: string,
    filePath: string,
    newContent: string,
    toolUseId?: string
): void {
    if (!validateRequiredFields({ fileName, filePath, newContent }, ['fileName', 'filePath', 'newContent'], 'fs.FileEditRequestNotify')) {
        return;
    }

    const notification: FileEditRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: "fsnotify",
        action: "updateFileRequest",
        data: {
            fileName: fileName,
            filePath: filePath,
            newContent: newContent
        }
    };

    sendNotification(notification, 'fs.FileEditRequestNotify');
}

/**
 * Sends a response to a file edit request
 * Requirements: 7.5
 */
export function FileEditResponseNotify(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for fs.FileEditResponseNotify');
        return;
    }

    const notification: FileEditResponseNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: "fsnotify",
        action: "updateFileResult",
        content: content,
        isError: isError
    };

    sendNotification(notification, 'fs.FileEditResponseNotify');
}

/**
 * Sends a request to delete a file
 * Requirements: 7.6
 */
export function deleteFile(
    data: FileDeleteRequestNotification['data'],
    toolUseId?: string
): void {
    const requiredFields = ['fileName', 'filePath'];
    if (!validateRequiredFields(data, requiredFields, 'fs.deleteFile')) {
        return;
    }

    const notification: FileDeleteRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: "fsnotify",
        action: "deleteFileRequest",
        data: {
            fileName: data.fileName,
            filePath: data.filePath
        }
    };

    sendNotification(notification, 'fs.deleteFile');
}

/**
 * Sends a response to a file delete request
 * Requirements: 7.6
 */
export function sendFileDeleteResponse(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for fs.sendFileDeleteResponse');
        return;
    }

    const notification: FileDeleteResponseNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: "fsnotify",
        action: "deleteFileResult",
        content: content,
        isError: isError
    };

    sendNotification(notification, 'fs.sendFileDeleteResponse');
}

/**
 * Sends a request to delete a folder
 * Requirements: 7.6
 */
export function deleteFolder(
    data: FolderDeleteRequestNotification['data'],
    toolUseId?: string
): void {
    const requiredFields = ['folderName', 'folderPath'];
    if (!validateRequiredFields(data, requiredFields, 'fs.deleteFolder')) {
        return;
    }

    const notification: FolderDeleteRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: "fsnotify",
        action: "deleteFolderRequest",
        data: {
            folderName: data.folderName,
            folderPath: data.folderPath
        }
    };

    sendNotification(notification, 'fs.deleteFolder');
}

/**
 * Sends a response to a folder delete request
 * Requirements: 7.6
 */
export function sendFolderDeleteResponse(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for fs.sendFolderDeleteResponse');
        return;
    }

    const notification: FolderDeleteResponseNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: "fsnotify",
        action: "deleteFolderResult",
        content: content,
        isError: isError
    };

    sendNotification(notification, 'fs.sendFolderDeleteResponse');
}/**
 * 
Sends a request to list directory contents
 * Requirements: 7.7
 */
export function listDirectory(
    data: ListDirectoryRequestNotification['data'],
    toolUseId?: string
): void {
    const requiredFields = ['dirPath'];
    if (!validateRequiredFields(data, requiredFields, 'fs.listDirectory')) {
        return;
    }

    const notification: ListDirectoryRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: "fsnotify",
        action: "listDirectoryRequest",
        data: {
            dirPath: data.dirPath
        }
    };

    sendNotification(notification, 'fs.listDirectory');
}

/**
 * Sends a response to a directory listing request
 * Requirements: 7.7
 */
export function sendListDirectoryResponse(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for fs.sendListDirectoryResponse');
        return;
    }

    const notification: ListDirectoryResponseNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: "fsnotify",
        action: "listDirectoryResult",
        content: content,
        isError: isError
    };

    sendNotification(notification, 'fs.sendListDirectoryResponse');
}

/**
 * Sends a request to write to a file
 * Requirements: 7.8
 */
export function writeToFile(
    data: WriteToFileRequestNotification['data'],
    toolUseId?: string
): void {
    const requiredFields = ['filePath', 'text'];
    if (!validateRequiredFields(data, requiredFields, 'fs.writeToFile')) {
        return;
    }

    const notification: WriteToFileRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: "fsnotify",
        action: "writeToFileRequest",
        data: {
            filePath: data.filePath,
            text: data.text
        }
    };

    sendNotification(notification, 'fs.writeToFile');
}

/**
 * Sends a response to a write to file request
 * Requirements: 7.8
 */
export function sendWriteToFileResponse(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for fs.sendWriteToFileResponse');
        return;
    }

    const notification: WriteToFileResponseNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: "fsnotify",
        action: "writeToFileResult",
        content: content,
        isError: isError
    };

    sendNotification(notification, 'fs.sendWriteToFileResponse');
}

/**
 * Sends a request to append to a file
 * Requirements: 7.9
 */
export function appendToFile(
    data: AppendToFileRequestNotification['data'],
    toolUseId?: string
): void {
    const requiredFields = ['filePath', 'text'];
    if (!validateRequiredFields(data, requiredFields, 'fs.appendToFile')) {
        return;
    }

    const notification: AppendToFileRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: "fsnotify",
        action: "appendToFileRequest",
        data: {
            filePath: data.filePath,
            text: data.text
        }
    };

    sendNotification(notification, 'fs.appendToFile');
}

/**
 * Sends a response to an append to file request
 * Requirements: 7.9
 */
export function sendAppendToFileResponse(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for fs.sendAppendToFileResponse');
        return;
    }

    const notification: AppendToFileResponseNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: "fsnotify",
        action: "appendToFileResult",
        content: content,
        isError: isError
    };

    sendNotification(notification, 'fs.sendAppendToFileResponse');
}/**

 * Sends a request to copy a file
 * Requirements: 7.10
 */
export function copyFile(
    data: CopyFileRequestNotification['data'],
    toolUseId?: string
): void {
    const requiredFields = ['sourceFile', 'destinationFile'];
    if (!validateRequiredFields(data, requiredFields, 'fs.copyFile')) {
        return;
    }

    const notification: CopyFileRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: "fsnotify",
        action: "copyFileRequest",
        data: {
            sourceFile: data.sourceFile,
            destinationFile: data.destinationFile
        }
    };

    sendNotification(notification, 'fs.copyFile');
}

/**
 * Sends a response to a file copy request
 * Requirements: 7.10
 */
export function sendCopyFileResponse(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for fs.sendCopyFileResponse');
        return;
    }

    const notification: CopyFileResponseNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: "fsnotify",
        action: "copyFileResult",
        content: content,
        isError: isError
    };

    sendNotification(notification, 'fs.sendCopyFileResponse');
}

/**
 * Sends a request to move a file
 * Requirements: 7.11
 */
export function moveFile(
    data: MoveFileRequestNotification['data'],
    toolUseId?: string
): void {
    const requiredFields = ['sourceFile', 'destinationFile'];
    if (!validateRequiredFields(data, requiredFields, 'fs.moveFile')) {
        return;
    }

    const notification: MoveFileRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: "fsnotify",
        action: "moveFileRequest",
        data: {
            sourceFile: data.sourceFile,
            destinationFile: data.destinationFile
        }
    };

    sendNotification(notification, 'fs.moveFile');
}

/**
 * Sends a response to a file move request
 * Requirements: 7.11
 */
export function sendMoveFileResponse(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for fs.sendMoveFileResponse');
        return;
    }

    const notification: MoveFileResponseNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: "fsnotify",
        action: "moveFileResult",
        content: content,
        isError: isError
    };

    sendNotification(notification, 'fs.sendMoveFileResponse');
}
/**
 * File system notification functions object
 */
export const fsNotifications: FsNotifications = {
    FileCreateRequestNotify,
    FileCreateResponseNotify,
    FolderCreateRequestNotify,
    FolderCreateResponseNotify,
    FileReadRequestNotify,
    FileReadResponseNotify,
    FileEditRequestNotify,
    FileEditResponseNotify,
    FileDeleteRequestNotify: deleteFile,
    FileDeleteResponseNotify: sendFileDeleteResponse,
    FolderDeleteRequestNotify: deleteFolder,
    FolderDeleteResponseNotify: sendFolderDeleteResponse,
    ListDirectoryRequestNotify: listDirectory,
    ListDirectoryResponseNotify: sendListDirectoryResponse,
    WriteToFileRequestNotify: writeToFile,
    WriteToFileResponseNotify: sendWriteToFileResponse,
    AppendToFileRequestNotify: appendToFile,
    AppendToFileResponseNotify: sendAppendToFileResponse,
    CopyFileRequestNotify: copyFile,
    CopyFileResponseNotify: sendCopyFileResponse,
    MoveFileRequestNotify: moveFile,
    MoveFileResponseNotify: sendMoveFileResponse
};

/**
 * Default export
 */
export default fsNotifications;