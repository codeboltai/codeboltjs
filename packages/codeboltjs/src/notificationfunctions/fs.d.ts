/**
 * File System Notification Functions
 *
 * This module provides functions for sending file system-related notifications,
 * including file and folder operations like create, read, edit, delete, etc.
 */
import { FsNotifications } from '../types/notificationFunctions/fs';
/**
 * Sends a request to create a file
 * Requirements: 7.1
 */
export declare function FileCreateRequestNotify(fileName: string, source: string, filePath: string, toolUseId?: string): void;
/**
 * Sends a response to a file creation request
 * Requirements: 7.2
 */
export declare function FileCreateResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
/**
 * Sends a request to create a folder
 * Requirements: 7.3
 */
export declare function FolderCreateRequestNotify(folderName: string, folderPath: string, toolUseId?: string): void;
/**
 * Sends a response to a folder creation request
 * Requirements: 7.4
 */
export declare function FolderCreateResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
/**
 * Sends a request to read a file
 * Requirements: 7.4
 */
export declare function FileReadRequestNotify(filePath: string, startLine?: string, endLine?: string, toolUseId?: string): void;
/**
 * Sends a response to a file read request
 * Requirements: 7.4
 */
export declare function FileReadResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
/**
 * Sends a request to edit a file
 * Requirements: 7.5
 */
export declare function FileEditRequestNotify(fileName: string, filePath: string, newContent: string, toolUseId?: string): void;
/**
 * Sends a response to a file edit request
 * Requirements: 7.5
 */
export declare function FileEditResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
/**
 * Sends a request to delete a file
 * Requirements: 7.6
 */
export declare function FileDeleteRequestNotify(fileName: string, filePath: string, toolUseId?: string): void;
/**
 * Sends a response to a file delete request
 * Requirements: 7.6
 */
export declare function FileDeleteResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
/**
 * Sends a request to delete a folder
 * Requirements: 7.6
 */
export declare function FolderDeleteRequestNotify(folderName: string, folderPath: string, toolUseId?: string): void;
/**
 * Sends a response to a folder delete request
 * Requirements: 7.6
 */
export declare function FolderDeleteResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void; /**
 *
Sends a request to list directory contents
 * Requirements: 7.7
 */
export declare function ListDirectoryRequestNotify(dirPath: string, toolUseId?: string): void;
/**
 * Sends a response to a directory listing request
 * Requirements: 7.7
 */
export declare function ListDirectoryResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
/**
 * Sends a request to write to a file
 * Requirements: 7.8
 */
export declare function WriteToFileRequestNotify(filePath: string, text: string, toolUseId?: string): void;
/**
 * Sends a response to a write to file request
 * Requirements: 7.8
 */
export declare function WriteToFileResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
/**
 * Sends a request to append to a file
 * Requirements: 7.9
 */
export declare function AppendToFileRequestNotify(filePath: string, text: string, toolUseId?: string): void;
/**
 * Sends a response to an append to file request
 * Requirements: 7.9
 */
export declare function AppendToFileResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void; /**

 * Sends a request to copy a file
 * Requirements: 7.10
 */
export declare function CopyFileRequestNotify(sourceFile: string, destinationFile: string, toolUseId?: string): void;
/**
 * Sends a response to a file copy request
 * Requirements: 7.10
 */
export declare function CopyFileResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
/**
 * Sends a request to move a file
 * Requirements: 7.11
 */
export declare function MoveFileRequestNotify(sourceFile: string, destinationFile: string, toolUseId?: string): void;
/**
 * Sends a response to a file move request
 * Requirements: 7.11
 */
export declare function MoveFileResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
/**
 * File system notification functions object
 */
export declare const fsNotifications: FsNotifications;
/**
 * Default export
 */
export default fsNotifications;
