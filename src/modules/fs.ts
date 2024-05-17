import cbws from './websocket';
import {CreateFileResponse,CreateFolderResponse,ReadFileResponse,UpdateFileResponse,DeleteFileResponse,DeleteFolderResponse} from  '@codebolt/types'
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
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type":"fsEvent",
                "action": "createFile",
                "message": {
                    fileName,
                    source,
                    filePath
                },
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "createFileResponse") {
                    resolve(response);
                }
            });
        });
    },
    /**
     * @function createFolder
     * @description Creates a new folder.
     * @param {string} folderName - The name of the folder to create.
     * @param {string} folderPath - The path where the folder should be created.
     * @returns {Promise<CreateFolderResponse>} A promise that resolves with the server response.
     */
    createFolder: (folderName: string, folderPath: string): Promise<CreateFolderResponse> => {
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type":"fsEvent",
                "action": "createFolder",
                "message": {
                    folderName,
                    folderPath
                },
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "createFolderResponse") {
                    resolve(response);
                }
            });
        });
    },
    /**
     * @function readFile
     * @description Reads the content of a file.
     * @param {string} filename - The name of the file to read.
     * @param {string} filePath - The path of the file to read.
     * @returns {Promise<ReadFileResponse>} A promise that resolves with the server response.
     */
    readFile: (filename: string, filePath: string): Promise<ReadFileResponse> => {
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type":"fsEvent",
                "action": "readFile",
                "message": {
                    filename,
                    filePath
                },
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "readFileResponse") {
                    resolve(response);
                }
            });
        });
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
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type":"fsEvent",
                "action": "updateFile",
                "message": {
                    filename,
                    filePath,
                    newContent
                },
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "commandOutput") {
                    resolve(response);
                }
            });
        });
    },
    /**
     * @function deleteFile
     * @description Deletes a file.
     * @param {string} filename - The name of the file to delete.
     * @param {string} filePath - The path of the file to delete.
     * @returns {Promise<DeleteFileResponse>} A promise that resolves with the server response.
     */
    deleteFile: (filename: string, filePath: string): Promise<DeleteFileResponse> => {
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type":"fsEvent",
                "action": "deleteFile",
                "message": {
                    filename,
                    filePath
                },
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "deleteFileResponse") {
                    resolve(response);
                }
            });
        });
    },
    /**
     * @function deleteFolder
     * @description Deletes a folder.
     * @param {string} foldername - The name of the folder to delete.
     * @param {string} folderpath - The path of the folder to delete.
     * @returns {Promise<DeleteFolderResponse>} A promise that resolves with the server response.
     */
    deleteFolder: (foldername: string, folderpath: string): Promise<DeleteFolderResponse> => {
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type":"fsEvent",
                "action": "deleteFolder",
                "message": {
                    foldername,
                    folderpath
                },
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "deleteFolderResponse") {
                    resolve(response);
                }
            });
        });
    },
    /**
     * @function listFile
     * @description Lists all files.
     * @returns {Promise<FileListResponse>} A promise that resolves with the list of files.
     */
    listFile: (filePath:string) => {
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "fsEvent",
                "action": "fileList",
                
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "fileListResponse") {
                    resolve(response);
                }
            });
        });
    },
  
};

export default cbfs;
