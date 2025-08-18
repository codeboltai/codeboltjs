import cbws from '../core/websocket';
import { CreateFileResponse, CreateFolderResponse, ReadFileResponse, UpdateFileResponse, DeleteFileResponse, DeleteFolderResponse } from '@codebolt/types/sdk';

import { FSAction, FSResponseType, EventType } from '@codebolt/types/enum';

/**
 * @module cbfs
 * @description This module provides functionality to interact with the filesystem.
 */


const cbfs = {
    /**
     * @function createFile
     * @description Creates a new file.
     * @param {string} fileName - The name of the file to create.
     * @param {string} source - The source content to write into the file.
     * @param {string} filePath - The path where the file should be created.
     * @returns {Promise<CreateFileResponse>} A promise that resolves with the server response.
     */
    createFile: (fileName: string, source: string, filePath: string): Promise<CreateFileResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.FS_EVENT,
                "action": FSAction.CREATE_FILE,
                "message": {
                    fileName,
                    source,
                    filePath
                },
            },
            FSResponseType.CREATE_FILE_RESPONSE
        );
    },
    /**
     * @function createFolder
     * @description Creates a new folder.
     * @param {string} folderName - The name of the folder to create.
     * @param {string} folderPath - The path where the folder should be created.
     * @returns {Promise<CreateFolderResponse>} A promise that resolves with the server response.
     */
    createFolder: (folderName: string, folderPath: string): Promise<CreateFolderResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.FS_EVENT,
                "action": FSAction.CREATE_FOLDER,
                "message": {
                    folderName,
                    folderPath
                },
            },
            FSResponseType.CREATE_FOLDER_RESPONSE
        );
    },
    /**
     * @function readFile
     * @description Reads the content of a file.
     * @param {string} filename - The name of the file to read.
     * @param {string} filePath - The path of the file to read.
     * @returns {Promise<ReadFileResponse>} A promise that resolves with the server response.
     */
    readFile: (filePath: string): Promise<ReadFileResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.FS_EVENT,
                "action": FSAction.READ_FILE,
                "message": {
                    filePath
                },
            },
            FSResponseType.READ_FILE_RESPONSE
        );
    },
    /**
     * @function updateFile
     * @description Updates the content of a file.
     * @param {string} filename - The name of the file to update.
     * @param {string} filePath - The path of the file to update.
     * @param {string} newContent - The new content to write into the file.
     * @returns {Promise<UpdateFileResponse>} A promise that resolves with the server response.
     */
    updateFile: (filename: string, filePath: string, newContent: string): Promise<UpdateFileResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.FS_EVENT,
                "action": FSAction.UPDATE_FILE,
                "message": {
                    filename,
                    filePath,
                    newContent
                },
            },
            FSResponseType.UPDATE_FILE_RESPONSE
        );
    },
    /**
     * @function deleteFile
     * @description Deletes a file.
     * @param {string} filename - The name of the file to delete.
     * @param {string} filePath - The path of the file to delete.
     * @returns {Promise<DeleteFileResponse>} A promise that resolves with the server response.
     */
    deleteFile: (filename: string, filePath: string): Promise<DeleteFileResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.FS_EVENT,
                "action": FSAction.DELETE_FILE,
                "message": {
                    filename,
                    filePath
                },
            },
            FSResponseType.DELETE_FILE_RESPONSE
        );
    },
    /**
     * @function deleteFolder
     * @description Deletes a folder.
     * @param {string} foldername - The name of the folder to delete.
     * @param {string} folderpath - The path of the folder to delete.
     * @returns {Promise<DeleteFolderResponse>} A promise that resolves with the server response.
     */
    deleteFolder: (foldername: string, folderpath: string): Promise<DeleteFolderResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.FS_EVENT,
                "action": FSAction.DELETE_FOLDER,
                "message": {
                    foldername,
                    folderpath
                },
            },
            FSResponseType.DELETE_FOLDER_RESPONSE
        );
    },
    /**
     * @function listFile
     * @description Lists all files.
     * @returns {Promise<FileListResponse>} A promise that resolves with the list of files.
     */
    listFile: (folderPath: string, isRecursive: boolean = false): Promise<any> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.FS_EVENT,
                "action": FSAction.FILE_LIST,
                message:{
                    folderPath,
                    isRecursive
                }
            },
            FSResponseType.FILE_LIST_RESPONSE
        );
    },
    /**
     * @function listCodeDefinitionNames
     * @description Lists all code definition names in a given path.
     * @param {string} path - The path to search for code definitions.
     * @returns {Promise<{success: boolean, result: any}>} A promise that resolves with the list of code definition names.
     */
    listCodeDefinitionNames: (path: string): Promise<{success: boolean, result: any}> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.FS_EVENT,
                "action": FSAction.LIST_CODE_DEFINITION_NAMES,
                "message": {
                    path
                }
            },
            FSResponseType.LIST_CODE_DEFINITION_NAMES_RESPONSE
        );
    },

    /**
     * @function searchFiles
     * @description Searches files in a given path using a regex pattern.
     * @param {string} path - The path to search within.
     * @param {string} regex - The regex pattern to search for.
     * @param {string} filePattern - The file pattern to match files.
     * @returns {Promise<{success: boolean, result: any}>} A promise that resolves with the search results.
     */
    searchFiles: (path: string, regex: string, filePattern: string): Promise<{success: boolean, result: any}> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.FS_EVENT,
                "action": FSAction.SEARCH_FILES,
                "message": {
                    path,
                    regex,
                    filePattern
                }
            },
            FSResponseType.SEARCH_FILES_RESPONSE
        );
    },
    /**
     * @function writeToFile
     * @description Writes content to a file.
     * @param {string} relPath - The relative path of the file to write to.
     * @param {string} newContent - The new content to write into the file.
     * @returns {Promise<{success: boolean, result: any}>} A promise that resolves with the write operation result.
     */
    writeToFile: (relPath:string, newContent:string) => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.FS_EVENT,
                "action": FSAction.WRITE_TO_FILE,
                "message": {
                    relPath,
                    newContent
                }
            },
            FSResponseType.WRITE_TO_FILE_RESPONSE
        );
    },
    
    /**
     * @function listFiles
     * @description Lists all files in a directory.
     * @param {string} path - The path to list files from.
     * @param {boolean} isRecursive - Whether to list files recursively.
     * @param {boolean} askForPermission - Whether to ask for permission before listing.
     * @returns {Promise<{success: boolean, result: any}>} A promise that resolves with the list of files.
     */
   
    
    /**
     * @function grepSearch
     * @description Performs a grep search in files.
     * @param {string} path - The path to search within.
     * @param {string} query - The query to search for.
     * @param {string} includePattern - Pattern of files to include.
     * @param {string} excludePattern - Pattern of files to exclude.
     * @param {boolean} caseSensitive - Whether the search is case sensitive.
     * @returns {Promise<{success: boolean, result: any}>} A promise that resolves with the search results.
     */
    grepSearch: (path: string, query: string, includePattern?: string, excludePattern?: string, caseSensitive: boolean = true): Promise<{success: boolean, result: any}> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.FS_EVENT,
                "action": FSAction.GREP_SEARCH,
                "message": {
                    path,
                    query,
                    includePattern,
                    excludePattern,
                    caseSensitive
                }
            },
            FSResponseType.GREP_SEARCH_RESPONSE
        );
    },
    
    /**
     * @function fileSearch
     * @description Performs a fuzzy search for files.
     * @param {string} query - The query to search for.
     * @returns {Promise<{success: boolean, result: any}>} A promise that resolves with the search results.
     */
    fileSearch: (query: string): Promise<{success: boolean, result: any}> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.FS_EVENT,
                "action": FSAction.FILE_SEARCH,
                "message": {
                    query
                }
            },
            FSResponseType.FILE_SEARCH_RESPONSE
        );
    },
    
    /**
     * @function editFileWithDiff
     * @description Edits a file by applying a diff.
     * @param {string} targetFile - The target file to edit.
     * @param {string} codeEdit - The code edit to apply.
     * @param {string} diffIdentifier - The diff identifier.
     * @param {string} prompt - The prompt for the edit.
     * @param {string} applyModel - The model to apply the edit with.
     * @returns {Promise<{success: boolean, result: any}>} A promise that resolves with the edit result.
     */
    editFileWithDiff: (targetFile: string, codeEdit: string, diffIdentifier: string, prompt: string, applyModel?: string): Promise<{success: boolean, result: any}> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.FS_EVENT,
                "action": FSAction.EDIT_FILE_WITH_DIFF,
                "message": {
                    target_file: targetFile,
                    code_edit: codeEdit,
                    diffIdentifier,
                    prompt,
                    applyModel
                }
            },
            FSResponseType.EDIT_FILE_AND_APPLY_DIFF_RESPONSE
        );
    },
  
};

export default cbfs;
