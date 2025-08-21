import { CreateFileResponse, CreateFolderResponse, ReadFileResponse, UpdateFileResponse, DeleteFileResponse, DeleteFolderResponse, FileListResponse, GrepSearchResponse, EditFileAndApplyDiffResponse, FileSearchResponse, SearchFilesResponse, ListCodeDefinitionsResponse } from '@codebolt/types/sdk';
/**
 * @module cbfs
 * @description This module provides functionality to interact with the filesystem.
 */
declare const cbfs: {
    /**
     * @function createFile
     * @description Creates a new file.
     * @param {string} fileName - The name of the file to create.
     * @param {string} source - The source content to write into the file.
     * @param {string} filePath - The path where the file should be created.
     * @returns {Promise<CreateFileResponse>} A promise that resolves with the server response.
     */
    createFile: (fileName: string, source: string, filePath: string) => Promise<CreateFileResponse>;
    /**
     * @function createFolder
     * @description Creates a new folder.
     * @param {string} folderName - The name of the folder to create.
     * @param {string} folderPath - The path where the folder should be created.
     * @returns {Promise<CreateFolderResponse>} A promise that resolves with the server response.
     */
    createFolder: (folderName: string, folderPath: string) => Promise<CreateFolderResponse>;
    /**
     * @function readFile
     * @description Reads the content of a file.
     * @param {string} filename - The name of the file to read.
     * @param {string} filePath - The path of the file to read.
     * @returns {Promise<ReadFileResponse>} A promise that resolves with the server response.
     */
    readFile: (filePath: string) => Promise<ReadFileResponse>;
    /**
     * @function updateFile
     * @description Updates the content of a file.
     * @param {string} filename - The name of the file to update.
     * @param {string} filePath - The path of the file to update.
     * @param {string} newContent - The new content to write into the file.
     * @returns {Promise<UpdateFileResponse>} A promise that resolves with the server response.
     */
    updateFile: (filename: string, filePath: string, newContent: string) => Promise<UpdateFileResponse>;
    /**
     * @function deleteFile
     * @description Deletes a file.
     * @param {string} filename - The name of the file to delete.
     * @param {string} filePath - The path of the file to delete.
     * @returns {Promise<DeleteFileResponse>} A promise that resolves with the server response.
     */
    deleteFile: (filename: string, filePath: string) => Promise<DeleteFileResponse>;
    /**
     * @function deleteFolder
     * @description Deletes a folder.
     * @param {string} foldername - The name of the folder to delete.
     * @param {string} folderpath - The path of the folder to delete.
     * @returns {Promise<DeleteFolderResponse>} A promise that resolves with the server response.
     */
    deleteFolder: (foldername: string, folderpath: string) => Promise<DeleteFolderResponse>;
    /**
     * @function listFile
     * @description Lists all files.
     * @returns {Promise<FileListResponse>} A promise that resolves with the list of files.
     */
    listFile: (folderPath: string, isRecursive?: boolean) => Promise<FileListResponse>;
    /**
     * @function listCodeDefinitionNames
     * @description Lists all code definition names in a given path.
     * @param {string} path - The path to search for code definitions.
     * @returns {Promise<ListCodeDefinitionsResponse>} A promise that resolves with the list of code definition names.
     */
    listCodeDefinitionNames: (path: string) => Promise<ListCodeDefinitionsResponse>;
    /**
     * @function searchFiles
     * @description Searches files in a given path using a regex pattern.
     * @param {string} path - The path to search within.
     * @param {string} regex - The regex pattern to search for.
     * @param {string} filePattern - The file pattern to match files.
     * @returns {Promise<SearchFilesResponse>} A promise that resolves with the search results.
     */
    searchFiles: (path: string, regex: string, filePattern: string) => Promise<SearchFilesResponse>;
    /**
     * @function writeToFile
     * @description Writes content to a file.
     * @param {string} relPath - The relative path of the file to write to.
     * @param {string} newContent - The new content to write into the file.
     * @returns {Promise<WriteToFileResponse>} A promise that resolves with the write operation result.
     */
    writeToFile: (relPath: string, newContent: string) => Promise<any>;
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
     * @returns {Promise<GrepSearchResponse>} A promise that resolves with the search results.
     */
    grepSearch: (path: string, query: string, includePattern?: string, excludePattern?: string, caseSensitive?: boolean) => Promise<GrepSearchResponse>;
    /**
     * @function fileSearch
     * @description Performs a fuzzy search for files.
     * @param {string} query - The query to search for.
     * @returns {Promise<FileSearchResponse>} A promise that resolves with the search results.
     */
    fileSearch: (query: string) => Promise<FileSearchResponse>;
    /**
     * @function editFileWithDiff
     * @description Edits a file by applying a diff.
     * @param {string} targetFile - The target file to edit.
     * @param {string} codeEdit - The code edit to apply.
     * @param {string} diffIdentifier - The diff identifier.
     * @param {string} prompt - The prompt for the edit.
     * @param {string} applyModel - The model to apply the edit with.
     * @returns {Promise<EditFileAndApplyDiffResponse>} A promise that resolves with the edit result.
     */
    editFileWithDiff: (targetFile: string, codeEdit: string, diffIdentifier: string, prompt: string, applyModel?: string) => Promise<EditFileAndApplyDiffResponse>;
};
export default cbfs;
