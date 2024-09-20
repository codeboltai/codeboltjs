"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const websocket_1 = __importDefault(require("./websocket"));
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
    createFile: (fileName, source, filePath) => {
        return new Promise((resolve, reject) => {
            websocket_1.default.getWebsocket.send(JSON.stringify({
                "type": "fsEvent",
                "action": "createFile",
                "message": {
                    fileName,
                    source,
                    filePath
                },
            }));
            websocket_1.default.getWebsocket.on('message', (data) => {
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
    createFolder: (folderName, folderPath) => {
        return new Promise((resolve, reject) => {
            websocket_1.default.getWebsocket.send(JSON.stringify({
                "type": "fsEvent",
                "action": "createFolder",
                "message": {
                    folderName,
                    folderPath
                },
            }));
            websocket_1.default.getWebsocket.on('message', (data) => {
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
    readFile: (filename, filePath) => {
        return new Promise((resolve, reject) => {
            websocket_1.default.getWebsocket.send(JSON.stringify({
                "type": "fsEvent",
                "action": "readFile",
                "message": {
                    filename,
                    filePath
                },
            }));
            websocket_1.default.getWebsocket.on('message', (data) => {
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
    updateFile: (filename, filePath, newContent) => {
        return new Promise((resolve, reject) => {
            websocket_1.default.getWebsocket.send(JSON.stringify({
                "type": "fsEvent",
                "action": "updateFile",
                "message": {
                    filename,
                    filePath,
                    newContent
                },
            }));
            websocket_1.default.getWebsocket.on('message', (data) => {
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
    deleteFile: (filename, filePath) => {
        return new Promise((resolve, reject) => {
            websocket_1.default.getWebsocket.send(JSON.stringify({
                "type": "fsEvent",
                "action": "deleteFile",
                "message": {
                    filename,
                    filePath
                },
            }));
            websocket_1.default.getWebsocket.on('message', (data) => {
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
    deleteFolder: (foldername, folderpath) => {
        return new Promise((resolve, reject) => {
            websocket_1.default.getWebsocket.send(JSON.stringify({
                "type": "fsEvent",
                "action": "deleteFolder",
                "message": {
                    foldername,
                    folderpath
                },
            }));
            websocket_1.default.getWebsocket.on('message', (data) => {
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
    listFile: (folderPath, isRecursive = false) => {
        return new Promise((resolve, reject) => {
            websocket_1.default.getWebsocket.send(JSON.stringify({
                "type": "fsEvent",
                "action": "fileList",
                message: {
                    folderPath,
                    isRecursive
                }
            }));
            websocket_1.default.getWebsocket.on('message', (data) => {
                const response = JSON.parse(data);
                if (response.type === "fileListResponse") {
                    resolve(response);
                }
            });
        });
    },
};
exports.default = cbfs;
