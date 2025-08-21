"use strict";
/**
 * File System Notification Functions
 *
 * This module provides functions for sending file system-related notifications,
 * including file and folder operations like create, read, edit, delete, etc.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.fsNotifications = void 0;
exports.FileCreateRequestNotify = FileCreateRequestNotify;
exports.FileCreateResponseNotify = FileCreateResponseNotify;
exports.FolderCreateRequestNotify = FolderCreateRequestNotify;
exports.FolderCreateResponseNotify = FolderCreateResponseNotify;
exports.FileReadRequestNotify = FileReadRequestNotify;
exports.FileReadResponseNotify = FileReadResponseNotify;
exports.FileEditRequestNotify = FileEditRequestNotify;
exports.FileEditResponseNotify = FileEditResponseNotify;
exports.FileDeleteRequestNotify = FileDeleteRequestNotify;
exports.FileDeleteResponseNotify = FileDeleteResponseNotify;
exports.FolderDeleteRequestNotify = FolderDeleteRequestNotify;
exports.FolderDeleteResponseNotify = FolderDeleteResponseNotify;
exports.ListDirectoryRequestNotify = ListDirectoryRequestNotify;
exports.ListDirectoryResponseNotify = ListDirectoryResponseNotify;
exports.WriteToFileRequestNotify = WriteToFileRequestNotify;
exports.WriteToFileResponseNotify = WriteToFileResponseNotify;
exports.AppendToFileRequestNotify = AppendToFileRequestNotify;
exports.AppendToFileResponseNotify = AppendToFileResponseNotify;
exports.CopyFileRequestNotify = CopyFileRequestNotify;
exports.CopyFileResponseNotify = CopyFileResponseNotify;
exports.MoveFileRequestNotify = MoveFileRequestNotify;
exports.MoveFileResponseNotify = MoveFileResponseNotify;
const utils_1 = require("./utils");
const enum_1 = require("@codebolt/types/enum");
/**
 * Sends a request to create a file
 * Requirements: 7.1
 */
function FileCreateRequestNotify(fileName, source, filePath, toolUseId) {
    if (!(0, utils_1.validateRequiredFields)({ fileName, source, filePath }, ['fileName', 'source', 'filePath'], 'fs.FileCreateRequestNotify')) {
        return;
    }
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.FS_NOTIFY,
        action: enum_1.FsNotificationAction.CREATE_FILE_REQUEST,
        data: {
            fileName: fileName,
            source: source,
            filePath: filePath
        }
    };
    (0, utils_1.sendNotification)(notification, 'fs.FileCreateRequestNotify');
}
/**
 * Sends a response to a file creation request
 * Requirements: 7.2
 */
function FileCreateResponseNotify(content, isError = false, toolUseId) {
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for fs.FileCreateResponseNotify');
        return;
    }
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.FS_NOTIFY,
        action: enum_1.FsNotificationAction.CREATE_FILE_RESULT,
        content: content,
        isError: isError
    };
    (0, utils_1.sendNotification)(notification, 'fs.FileCreateResponseNotify');
}
/**
 * Sends a request to create a folder
 * Requirements: 7.3
 */
function FolderCreateRequestNotify(folderName, folderPath, toolUseId) {
    if (!(0, utils_1.validateRequiredFields)({ folderName, folderPath }, ['folderName', 'folderPath'], 'fs.FolderCreateRequestNotify')) {
        return;
    }
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.FS_NOTIFY,
        action: enum_1.FsNotificationAction.CREATE_FOLDER_REQUEST,
        data: {
            folderName: folderName,
            folderPath: folderPath
        }
    };
    (0, utils_1.sendNotification)(notification, 'fs.FolderCreateRequestNotify');
}
/**
 * Sends a response to a folder creation request
 * Requirements: 7.4
 */
function FolderCreateResponseNotify(content, isError = false, toolUseId) {
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for fs.FolderCreateResponseNotify');
        return;
    }
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.FS_NOTIFY,
        action: enum_1.FsNotificationAction.CREATE_FOLDER_RESULT,
        content: content,
        isError: isError
    };
    (0, utils_1.sendNotification)(notification, 'fs.FolderCreateResponseNotify');
}
/**
 * Sends a request to read a file
 * Requirements: 7.4
 */
function FileReadRequestNotify(filePath, startLine, endLine, toolUseId) {
    if (!(0, utils_1.validateRequiredFields)({ filePath }, ['filePath'], 'fs.FileReadRequestNotify')) {
        return;
    }
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.FS_NOTIFY,
        action: enum_1.FsNotificationAction.READ_FILE_REQUEST,
        data: {
            filePath: filePath,
            startLine: startLine,
            endLine: endLine
        }
    };
    (0, utils_1.sendNotification)(notification, 'fs.FileReadRequestNotify');
}
/**
 * Sends a response to a file read request
 * Requirements: 7.4
 */
function FileReadResponseNotify(content, isError = false, toolUseId) {
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for fs.FileReadResponseNotify');
        return;
    }
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.FS_NOTIFY,
        action: enum_1.FsNotificationAction.READ_FILE_RESULT,
        content: content,
        isError: isError
    };
    (0, utils_1.sendNotification)(notification, 'fs.FileReadResponseNotify');
}
/**
 * Sends a request to edit a file
 * Requirements: 7.5
 */
function FileEditRequestNotify(fileName, filePath, newContent, toolUseId) {
    if (!(0, utils_1.validateRequiredFields)({ fileName, filePath, newContent }, ['fileName', 'filePath', 'newContent'], 'fs.FileEditRequestNotify')) {
        return;
    }
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.FS_NOTIFY,
        action: enum_1.FsNotificationAction.UPDATE_FILE_REQUEST,
        data: {
            fileName: fileName,
            filePath: filePath,
            newContent: newContent
        }
    };
    (0, utils_1.sendNotification)(notification, 'fs.FileEditRequestNotify');
}
/**
 * Sends a response to a file edit request
 * Requirements: 7.5
 */
function FileEditResponseNotify(content, isError = false, toolUseId) {
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for fs.FileEditResponseNotify');
        return;
    }
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.FS_NOTIFY,
        action: enum_1.FsNotificationAction.UPDATE_FILE_RESULT,
        content: content,
        isError: isError
    };
    (0, utils_1.sendNotification)(notification, 'fs.FileEditResponseNotify');
}
/**
 * Sends a request to delete a file
 * Requirements: 7.6
 */
function FileDeleteRequestNotify(fileName, filePath, toolUseId) {
    if (!(0, utils_1.validateRequiredFields)({ fileName, filePath }, ['fileName', 'filePath'], 'fs.FileDeleteRequestNotify')) {
        return;
    }
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.FS_NOTIFY,
        action: enum_1.FsNotificationAction.DELETE_FILE_REQUEST,
        data: {
            fileName: fileName,
            filePath: filePath
        }
    };
    (0, utils_1.sendNotification)(notification, 'fs.FileDeleteRequestNotify');
}
/**
 * Sends a response to a file delete request
 * Requirements: 7.6
 */
function FileDeleteResponseNotify(content, isError = false, toolUseId) {
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for fs.FileDeleteResponseNotify');
        return;
    }
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.FS_NOTIFY,
        action: enum_1.FsNotificationAction.DELETE_FILE_RESULT,
        content: content,
        isError: isError
    };
    (0, utils_1.sendNotification)(notification, 'fs.FileDeleteResponseNotify');
}
/**
 * Sends a request to delete a folder
 * Requirements: 7.6
 */
function FolderDeleteRequestNotify(folderName, folderPath, toolUseId) {
    if (!(0, utils_1.validateRequiredFields)({ folderName, folderPath }, ['folderName', 'folderPath'], 'fs.FolderDeleteRequestNotify')) {
        return;
    }
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.FS_NOTIFY,
        action: enum_1.FsNotificationAction.DELETE_FOLDER_REQUEST,
        data: {
            folderName: folderName,
            folderPath: folderPath
        }
    };
    (0, utils_1.sendNotification)(notification, 'fs.FolderDeleteRequestNotify');
}
/**
 * Sends a response to a folder delete request
 * Requirements: 7.6
 */
function FolderDeleteResponseNotify(content, isError = false, toolUseId) {
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for fs.FolderDeleteResponseNotify');
        return;
    }
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.FS_NOTIFY,
        action: enum_1.FsNotificationAction.DELETE_FOLDER_RESULT,
        content: content,
        isError: isError
    };
    (0, utils_1.sendNotification)(notification, 'fs.FolderDeleteResponseNotify');
} /**
 *
Sends a request to list directory contents
 * Requirements: 7.7
 */
function ListDirectoryRequestNotify(dirPath, toolUseId) {
    if (!(0, utils_1.validateRequiredFields)({ dirPath }, ['dirPath'], 'fs.ListDirectoryRequestNotify')) {
        return;
    }
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.FS_NOTIFY,
        action: enum_1.FsNotificationAction.LIST_DIRECTORY_REQUEST,
        data: {
            dirPath: dirPath
        }
    };
    (0, utils_1.sendNotification)(notification, 'fs.ListDirectoryRequestNotify');
}
/**
 * Sends a response to a directory listing request
 * Requirements: 7.7
 */
function ListDirectoryResponseNotify(content, isError = false, toolUseId) {
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for fs.ListDirectoryResponseNotify');
        return;
    }
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.FS_NOTIFY,
        action: enum_1.FsNotificationAction.LIST_DIRECTORY_RESULT,
        content: content,
        isError: isError
    };
    (0, utils_1.sendNotification)(notification, 'fs.ListDirectoryResponseNotify');
}
/**
 * Sends a request to write to a file
 * Requirements: 7.8
 */
function WriteToFileRequestNotify(filePath, text, toolUseId) {
    if (!(0, utils_1.validateRequiredFields)({ filePath, text }, ['filePath', 'text'], 'fs.WriteToFileRequestNotify')) {
        return;
    }
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.FS_NOTIFY,
        action: enum_1.FsNotificationAction.WRITE_TO_FILE_REQUEST,
        data: {
            filePath: filePath,
            text: text
        }
    };
    (0, utils_1.sendNotification)(notification, 'fs.WriteToFileRequestNotify');
}
/**
 * Sends a response to a write to file request
 * Requirements: 7.8
 */
function WriteToFileResponseNotify(content, isError = false, toolUseId) {
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for fs.WriteToFileResponseNotify');
        return;
    }
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.FS_NOTIFY,
        action: enum_1.FsNotificationAction.WRITE_TO_FILE_RESULT,
        content: content,
        isError: isError
    };
    (0, utils_1.sendNotification)(notification, 'fs.WriteToFileResponseNotify');
}
/**
 * Sends a request to append to a file
 * Requirements: 7.9
 */
function AppendToFileRequestNotify(filePath, text, toolUseId) {
    if (!(0, utils_1.validateRequiredFields)({ filePath, text }, ['filePath', 'text'], 'fs.AppendToFileRequestNotify')) {
        return;
    }
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.FS_NOTIFY,
        action: enum_1.FsNotificationAction.APPEND_TO_FILE_REQUEST,
        data: {
            filePath: filePath,
            text: text
        }
    };
    (0, utils_1.sendNotification)(notification, 'fs.AppendToFileRequestNotify');
}
/**
 * Sends a response to an append to file request
 * Requirements: 7.9
 */
function AppendToFileResponseNotify(content, isError = false, toolUseId) {
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for fs.AppendToFileResponseNotify');
        return;
    }
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.FS_NOTIFY,
        action: enum_1.FsNotificationAction.APPEND_TO_FILE_RESULT,
        content: content,
        isError: isError
    };
    (0, utils_1.sendNotification)(notification, 'fs.AppendToFileResponseNotify');
} /**

 * Sends a request to copy a file
 * Requirements: 7.10
 */
function CopyFileRequestNotify(sourceFile, destinationFile, toolUseId) {
    if (!(0, utils_1.validateRequiredFields)({ sourceFile, destinationFile }, ['sourceFile', 'destinationFile'], 'fs.CopyFileRequestNotify')) {
        return;
    }
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.FS_NOTIFY,
        action: enum_1.FsNotificationAction.COPY_FILE_REQUEST,
        data: {
            sourceFile: sourceFile,
            destinationFile: destinationFile
        }
    };
    (0, utils_1.sendNotification)(notification, 'fs.CopyFileRequestNotify');
}
/**
 * Sends a response to a file copy request
 * Requirements: 7.10
 */
function CopyFileResponseNotify(content, isError = false, toolUseId) {
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for fs.CopyFileResponseNotify');
        return;
    }
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.FS_NOTIFY,
        action: enum_1.FsNotificationAction.COPY_FILE_RESULT,
        content: content,
        isError: isError
    };
    (0, utils_1.sendNotification)(notification, 'fs.CopyFileResponseNotify');
}
/**
 * Sends a request to move a file
 * Requirements: 7.11
 */
function MoveFileRequestNotify(sourceFile, destinationFile, toolUseId) {
    if (!(0, utils_1.validateRequiredFields)({ sourceFile, destinationFile }, ['sourceFile', 'destinationFile'], 'fs.MoveFileRequestNotify')) {
        return;
    }
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.FS_NOTIFY,
        action: enum_1.FsNotificationAction.MOVE_FILE_REQUEST,
        data: {
            sourceFile: sourceFile,
            destinationFile: destinationFile
        }
    };
    (0, utils_1.sendNotification)(notification, 'fs.MoveFileRequestNotify');
}
/**
 * Sends a response to a file move request
 * Requirements: 7.11
 */
function MoveFileResponseNotify(content, isError = false, toolUseId) {
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for fs.MoveFileResponseNotify');
        return;
    }
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.FS_NOTIFY,
        action: enum_1.FsNotificationAction.MOVE_FILE_RESULT,
        content: content,
        isError: isError
    };
    (0, utils_1.sendNotification)(notification, 'fs.MoveFileResponseNotify');
}
/**
 * File system notification functions object
 */
exports.fsNotifications = {
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
exports.default = exports.fsNotifications;
