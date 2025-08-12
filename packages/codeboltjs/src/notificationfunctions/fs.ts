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

import { FsNotifications } from '../types/notificationFunctions/fs';

import {
    sendNotification,
    generateToolUseId,
    validateRequiredFields
} from './utils';
import { FsNotificationAction, NotificationEventType } from '@codebolt/types';

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
        type: NotificationEventType.FS_NOTIFY,
        action: FsNotificationAction.CREATE_FILE_REQUEST,
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
        type: NotificationEventType.FS_NOTIFY,
        action: FsNotificationAction.CREATE_FILE_RESULT,
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
        type: NotificationEventType.FS_NOTIFY,
        action: FsNotificationAction.CREATE_FOLDER_REQUEST,
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
        type: NotificationEventType.FS_NOTIFY,
        action: FsNotificationAction.CREATE_FOLDER_RESULT,
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
        type: NotificationEventType.FS_NOTIFY,
        action: FsNotificationAction.READ_FILE_REQUEST,
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
        type: NotificationEventType.FS_NOTIFY,
        action: FsNotificationAction.READ_FILE_RESULT,
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
        type: NotificationEventType.FS_NOTIFY,
        action: FsNotificationAction.UPDATE_FILE_REQUEST,
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
        type: NotificationEventType.FS_NOTIFY,
        action: FsNotificationAction.UPDATE_FILE_RESULT,
        content: content,
        isError: isError
    };

    sendNotification(notification, 'fs.FileEditResponseNotify');
}

/**
 * Sends a request to delete a file
 * Requirements: 7.6
 */
export function FileDeleteRequestNotify(
    fileName: string,
    filePath: string,
    toolUseId?: string
): void {
    if (!validateRequiredFields({ fileName, filePath }, ['fileName', 'filePath'], 'fs.FileDeleteRequestNotify')) {
        return;
    }

    const notification: FileDeleteRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: NotificationEventType.FS_NOTIFY,
        action: FsNotificationAction.DELETE_FILE_REQUEST,
        data: {
            fileName: fileName,
            filePath: filePath
        }
    };

    sendNotification(notification, 'fs.FileDeleteRequestNotify');
}

/**
 * Sends a response to a file delete request
 * Requirements: 7.6
 */
export function FileDeleteResponseNotify(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for fs.FileDeleteResponseNotify');
        return;
    }

    const notification: FileDeleteResponseNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: NotificationEventType.FS_NOTIFY,
        action: FsNotificationAction.DELETE_FILE_RESULT,
        content: content,
        isError: isError
    };

    sendNotification(notification, 'fs.FileDeleteResponseNotify');
}

/**
 * Sends a request to delete a folder
 * Requirements: 7.6
 */
export function FolderDeleteRequestNotify(
    folderName: string,
    folderPath: string,
    toolUseId?: string
): void {
    if (!validateRequiredFields({ folderName, folderPath }, ['folderName', 'folderPath'], 'fs.FolderDeleteRequestNotify')) {
        return;
    }

    const notification: FolderDeleteRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: NotificationEventType.FS_NOTIFY,
        action: FsNotificationAction.DELETE_FOLDER_REQUEST,
        data: {
            folderName: folderName,
            folderPath: folderPath
        }
    };

    sendNotification(notification, 'fs.FolderDeleteRequestNotify');
}

/**
 * Sends a response to a folder delete request
 * Requirements: 7.6
 */
export function FolderDeleteResponseNotify(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for fs.FolderDeleteResponseNotify');
        return;
    }

    const notification: FolderDeleteResponseNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: NotificationEventType.FS_NOTIFY,
        action: FsNotificationAction.DELETE_FOLDER_RESULT,
        content: content,
        isError: isError
    };

    sendNotification(notification, 'fs.FolderDeleteResponseNotify');
}/**
 * 
Sends a request to list directory contents
 * Requirements: 7.7
 */
export function ListDirectoryRequestNotify(
    dirPath: string,
    toolUseId?: string
): void {
    if (!validateRequiredFields({ dirPath }, ['dirPath'], 'fs.ListDirectoryRequestNotify')) {
        return;
    }

    const notification: ListDirectoryRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: NotificationEventType.FS_NOTIFY,
        action: FsNotificationAction.LIST_DIRECTORY_REQUEST,
        data: {
            dirPath: dirPath
        }
    };

    sendNotification(notification, 'fs.ListDirectoryRequestNotify');
}

/**
 * Sends a response to a directory listing request
 * Requirements: 7.7
 */
export function ListDirectoryResponseNotify(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for fs.ListDirectoryResponseNotify');
        return;
    }

    const notification: ListDirectoryResponseNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: NotificationEventType.FS_NOTIFY,
        action: FsNotificationAction.LIST_DIRECTORY_RESULT,
        content: content,
        isError: isError
    };

    sendNotification(notification, 'fs.ListDirectoryResponseNotify');
}

/**
 * Sends a request to write to a file
 * Requirements: 7.8
 */
export function WriteToFileRequestNotify(
    filePath: string,
    text: string,
    toolUseId?: string
): void {
    if (!validateRequiredFields({ filePath, text }, ['filePath', 'text'], 'fs.WriteToFileRequestNotify')) {
        return;
    }

    const notification: WriteToFileRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: NotificationEventType.FS_NOTIFY,
        action: FsNotificationAction.WRITE_TO_FILE_REQUEST,
        data: {
            filePath: filePath,
            text: text
        }
    };

    sendNotification(notification, 'fs.WriteToFileRequestNotify');
}

/**
 * Sends a response to a write to file request
 * Requirements: 7.8
 */
export function WriteToFileResponseNotify(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for fs.WriteToFileResponseNotify');
        return;
    }

    const notification: WriteToFileResponseNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: NotificationEventType.FS_NOTIFY,
        action: FsNotificationAction.WRITE_TO_FILE_RESULT,
        content: content,
        isError: isError
    };

    sendNotification(notification, 'fs.WriteToFileResponseNotify');
}

/**
 * Sends a request to append to a file
 * Requirements: 7.9
 */
export function AppendToFileRequestNotify(
    filePath: string,
    text: string,
    toolUseId?: string
): void {
    if (!validateRequiredFields({ filePath, text }, ['filePath', 'text'], 'fs.AppendToFileRequestNotify')) {
        return;
    }

    const notification: AppendToFileRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: NotificationEventType.FS_NOTIFY,
        action: FsNotificationAction.APPEND_TO_FILE_REQUEST,
        data: {
            filePath: filePath,
            text: text
        }
    };

    sendNotification(notification, 'fs.AppendToFileRequestNotify');
}

/**
 * Sends a response to an append to file request
 * Requirements: 7.9
 */
export function AppendToFileResponseNotify(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for fs.AppendToFileResponseNotify');
        return;
    }

    const notification: AppendToFileResponseNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: NotificationEventType.FS_NOTIFY,
        action: FsNotificationAction.APPEND_TO_FILE_RESULT,
        content: content,
        isError: isError
    };

    sendNotification(notification, 'fs.AppendToFileResponseNotify');
}/**

 * Sends a request to copy a file
 * Requirements: 7.10
 */
export function CopyFileRequestNotify(
    sourceFile: string,
    destinationFile: string,
    toolUseId?: string
): void {
    if (!validateRequiredFields({ sourceFile, destinationFile }, ['sourceFile', 'destinationFile'], 'fs.CopyFileRequestNotify')) {
        return;
    }

    const notification: CopyFileRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: NotificationEventType.FS_NOTIFY,
        action: FsNotificationAction.COPY_FILE_REQUEST,
        data: {
            sourceFile: sourceFile,
            destinationFile: destinationFile
        }
    };

    sendNotification(notification, 'fs.CopyFileRequestNotify');
}

/**
 * Sends a response to a file copy request
 * Requirements: 7.10
 */
export function CopyFileResponseNotify(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for fs.CopyFileResponseNotify');
        return;
    }

    const notification: CopyFileResponseNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: NotificationEventType.FS_NOTIFY,
        action: FsNotificationAction.COPY_FILE_RESULT,
        content: content,
        isError: isError
    };

    sendNotification(notification, 'fs.CopyFileResponseNotify');
}

/**
 * Sends a request to move a file
 * Requirements: 7.11
 */
export function MoveFileRequestNotify(
    sourceFile: string,
    destinationFile: string,
    toolUseId?: string
): void {
    if (!validateRequiredFields({ sourceFile, destinationFile }, ['sourceFile', 'destinationFile'], 'fs.MoveFileRequestNotify')) {
        return;
    }

    const notification: MoveFileRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: NotificationEventType.FS_NOTIFY,
        action: FsNotificationAction.MOVE_FILE_REQUEST,
        data: {
            sourceFile: sourceFile,
            destinationFile: destinationFile
        }
    };

    sendNotification(notification, 'fs.MoveFileRequestNotify');
}

/**
 * Sends a response to a file move request
 * Requirements: 7.11
 */
export function MoveFileResponseNotify(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for fs.MoveFileResponseNotify');
        return;
    }

    const notification: MoveFileResponseNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: NotificationEventType.FS_NOTIFY,
        action: FsNotificationAction.MOVE_FILE_RESULT,
        content: content,
        isError: isError
    };

    sendNotification(notification, 'fs.MoveFileResponseNotify');
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
    FileDeleteRequestNotify,
    FileDeleteResponseNotify,
    FolderDeleteRequestNotify,
    FolderDeleteResponseNotify,
    ListDirectoryRequestNotify,
    ListDirectoryResponseNotify,
    WriteToFileRequestNotify,
    WriteToFileResponseNotify,
    AppendToFileRequestNotify,
    AppendToFileResponseNotify,
    CopyFileRequestNotify,
    CopyFileResponseNotify,
    MoveFileRequestNotify,
    MoveFileResponseNotify
};

/**
 * Default export
 */
export default fsNotifications;