import cbws from './websocket';
import cbfs from '../modules/fs';
import cbllm from '../modules/llm';
import cbterminal from '../modules/terminal';
import cbbrowser from '../modules/browser';
import cbchat from '../modules/chat';
import cbcodeutils from '../modules/codeutils';
import cbcrawler from '../modules/crawler';
import cbsearch from '../modules/search';
import cbknowledge from '../modules/knowledge';
import cbrag from '../modules/rag';
import cboutputparsers from '../modules/outputparsers';
import cbproject from '../modules/project';
import git from '../modules/git';
import dbmemory from '../modules/dbmemory';
import cbstate from '../modules/state';
import task from '../modules/task';
import vectorDB from '../modules/vectordb';
import debug from '../modules/debug';
import tokenizer from '../modules/tokenizer';
import WebSocket from 'ws';
import { chatSummary } from '../modules/history';
import codeboltTools from '../modules/mcp';
import codebotMemory from '../modules/memory'
import cbagent from '../modules/agent';
import cbutils from '../modules/utils';
import codeboltActionPlans from '../modules/actionPlan';
import cbmail from '../modules/mail';
import { notificationFunctions, type NotificationFunctions } from '../notificationfunctions';

import type { FlatUserMessage } from '@codebolt/types/sdk';
import { userMessageManager } from '../modules/user-message-manager';
import { userMessageUtilities } from '../modules/user-message-utilities';
import { RawMessageForAgent, AgentStartMessage, ProviderInitVars } from '@codebolt/types/provider'
import thread from '../modules/thread'
import todo from '../modules/todo'
import job from '../modules/job'
/**
 * @class Codebolt
 * @description This class provides a unified interface to interact with various modules.
 */
class Codebolt {
    websocket: WebSocket | null = null;
    private isReady: boolean = false;
    private readyPromise: Promise<void>;
    private readyHandlers: Array<() => void | Promise<void>> = [];
    private messageQueue: FlatUserMessage[] = [];
    private messageResolvers: Array<(message: FlatUserMessage) => void> = [];
    private lastUserMessage: FlatUserMessage | undefined

    /**
     * @constructor
     * @description Initializes the websocket connection.
     */
    constructor() {
        console.log("Codebolt Agent initialized");
        this.readyPromise = this.initializeConnection();
        this.setupMessageListener()
        this.lastUserMessage = undefined
    }

    /**
     * @method initializeConnection
     * @description Initializes the WebSocket connection asynchronously.
     * @private
     */
    private async initializeConnection(): Promise<void> {
        try {
            await cbws.initializeWebSocket();
            this.websocket = cbws.getWebsocket;
            this.isReady = true;
            console.log("Codebolt WebSocket connection established");

            // Execute all registered ready handlers
            for (const handler of this.readyHandlers) {
                try {
                    await handler();
                } catch (error) {
                    console.error('Error executing ready handler:', error);
                }
            }
        } catch (error) {
            console.error('Failed to initialize WebSocket connection:', error);
            throw error;
        }
    }

    /**
     * @method waitForReady
     * @description Waits for the Codebolt instance to be fully initialized.
     * @returns {Promise<void>} A promise that resolves when the instance is ready.
     */
    async waitForReady(): Promise<void> {
        return this.readyPromise;
    }

    /**
     * @method isReady
     * @description Checks if the Codebolt instance is ready for use.
     * @returns {boolean} True if the instance is ready, false otherwise.
     */
    get ready(): boolean {
        return this.isReady;
    }

    fs = cbfs;
    git = git;
    llm = cbllm;
    mail = cbmail;
    browser = cbbrowser;
    chat = cbchat;
    terminal = cbterminal;
    codeutils = cbcodeutils;
    crawler = cbcrawler;
    search = cbsearch;
    knowledge = cbknowledge;
    rag = cbrag;
    outputparsers = cboutputparsers;
    project = cbproject;
    dbmemory = dbmemory;
    cbstate = cbstate;
    task = task;
    thread = thread;
    vectordb = vectorDB;
    debug = debug;
    tokenizer = tokenizer;
    chatSummary = chatSummary;
    mcp = codeboltTools;
    agent = cbagent;
    utils = cbutils;
    notify = notificationFunctions;
    memory = codebotMemory;
    actionPlan = codeboltActionPlans;
    todo = todo;
    job = job;

    /**
     * User message utilities for accessing current user message and context
     */
    userMessage = userMessageUtilities;

    /**
     * Sets up a handler function to be executed when the WebSocket connection is established.
     * If the connection is already established, the handler will be executed immediately.
     * @param {Function} handler - The handler function to call when the connection is ready.
     * @returns {void}
     */
    onReady(handler: () => void | Promise<void>) {
        if (this.isReady) {
            // If already ready, execute the handler immediately
            try {
                const result = handler();
                if (result instanceof Promise) {
                    result.catch(error => {
                        console.error('Error in ready handler:', error);
                    });
                }
            } catch (error) {
                console.error('Error in ready handler:', error);
            }
        } else {
            // If not ready yet, add to the list of handlers to execute when ready
            this.readyHandlers.push(handler);
        }
    }

    /**
     * Gets the current or next incoming message.
     * Priority order:
     * 1. Returns the current message being processed (if called during message handling)
     * 2. Returns a queued message (if any are waiting)
     * 3. Waits for the next message to arrive
     * 
     * This allows getMessage() to work both during active message processing
     * and when waiting for new messages in a loop.
     * 
     * @returns {Promise<FlatUserMessage>} A promise that resolves with the message
     */
    async getMessage(): Promise<FlatUserMessage> {
        // Wait for WebSocket to be ready first
        console.log('[Codebolt] getMessage called');
        // await this.waitForReady();


        // First, check if there's a current message being processed
        const currentMessage = userMessageManager.getMessage();
        if (currentMessage) {
            console.log('[Codebolt] Returning current message');
            return Promise.resolve(currentMessage);
        }

        // If there are queued messages, return the first one
        if (this.messageQueue.length > 0 || this.lastUserMessage) {
            console.log('[Codebolt] Returning queued message');
            const message = this.messageQueue.shift() || this.lastUserMessage;
            if (message)
                return Promise.resolve(message);
        }

        // Otherwise, create a new promise that will be resolved when a message arrives
        console.log('[Codebolt] Waiting for next message');
        return new Promise<FlatUserMessage>((resolve) => {
            this.messageResolvers.push(resolve);
        });
    }

    /**
     * Handles an incoming message by either resolving a waiting promise
     * or adding it to the queue if no promises are waiting.
     * @private
     */
    private handleIncomingMessage(message: FlatUserMessage) {
        if (this.messageResolvers.length > 0) {
            // If there are waiting resolvers, resolve the first one
            const resolver = this.messageResolvers.shift()!;
            resolver(message);
        } else {
            // Otherwise, add to the queue
            this.messageQueue.push(message);
        }
    }

    /**
     * Sets up a background listener for all messageResponse messages from the socket.
     * This ensures that getMessage() promises are always resolved even if onMessage() is not called.
     * @private
     */
    private setupMessageListener() {
        console.log("listener setup")
        this.waitForReady().then(() => {
            const handleSocketMessage = async (response: any) => {
                console.log(response)
                if (response.type === "messageResponse") {
                    // Extract user-facing message from internal socket message
                    const userMessage: FlatUserMessage = {
                        userMessage: response.message.userMessage,
                        currentFile: response.message.currentFile,
                        mentionedFiles: response.message.mentionedFiles || [],
                        mentionedFullPaths: response.message.mentionedFullPaths || [],
                        mentionedFolders: response.message.mentionedFolders || [],
                        uploadedImages: response.message.uploadedImages || [],
                        mentionedMCPs: response.message.mentionedMCPs || [],
                        selectedAgent: {
                            id: response.message.selectedAgent?.id || '',
                            name: response.message.selectedAgent?.name || ''
                        },
                        messageId: response.message.messageId,
                        threadId: response.message.threadId,
                        selection: response.message.selection,
                        remixPrompt: response.message.remixPrompt,
                        mentionedAgents: response.message.mentionedAgents || [],
                        activeFile: response.message.activeFile,
                        openedFiles: response.message.activeFile
                    };

                    // Automatically save the user message globally
                    userMessageManager.saveMessage(userMessage);
                    this.lastUserMessage = userMessage;
                    // Handle the message in the queue system for getMessage() resolvers
                    this.handleIncomingMessage(userMessage);
                }
            };

            cbws.messageManager.on('message', handleSocketMessage);
        }).catch(error => {
            console.error('Failed to set up background message listener:', error);
        });
    }

    /**
     * Sets up a listener for incoming messages with a direct handler function.
     * Note: Message extraction and resolver handling is done by setupMessageListener.
     * This method only adds the custom handler logic and sends processStoped response.
     * @param {Function} handler - The handler function to call when a message is received.
     * @returns {void}
     */
    onMessage(handler: (userMessage: FlatUserMessage) => void | Promise<void> | any | Promise<any>) {
        // Wait for the WebSocket to be ready before setting up the handler
        this.waitForReady().then(() => {
            const handleUserMessage = async (response: any) => {
                console.log("Message received By Agent Library Starting Custom Agent Handler Logic", response);
                if (response.type === "messageResponse") {
                    try {
                        // Extract user-facing message from internal socket message
                        const userMessage: FlatUserMessage = {
                            userMessage: response.message.userMessage,
                            currentFile: response.message.currentFile,
                            mentionedFiles: response.message.mentionedFiles || [],
                            mentionedFullPaths: response.message.mentionedFullPaths || [],
                            mentionedFolders: response.message.mentionedFolders || [],
                            uploadedImages: response.message.uploadedImages || [],
                            mentionedMCPs: response.message.mentionedMCPs || [],
                            selectedAgent: {
                                id: response.message.selectedAgent?.id || '',
                                name: response.message.selectedAgent?.name || ''
                            },
                            messageId: response.message.messageId,
                            threadId: response.message.threadId,
                            selection: response.message.selection,
                            remixPrompt: response.message.remixPrompt,
                            mentionedAgents: response.message.mentionedAgents || [],
                            activeFile: response.message.activeFile,
                            openedFiles: response.message.activeFile
                        };

                        // Call the custom handler
                        const result = await handler(userMessage);

                        // Send processStoped with optional message
                        const message: any = {
                            "type": "processStoped"
                        };

                        // If handler returned data, include it as message
                        if (result !== undefined && result !== null) {
                            message.message = result;
                        }

                        cbws.messageManager.send(message);
                    } catch (error) {
                        console.error('Error in user message handler:', error);
                        // Send processStoped even if there's an error
                        cbws.messageManager.send({
                            "type": "processStoped",
                            "error": error instanceof Error ? error.message : "Unknown error occurred"
                        });
                    }
                }
            };

            cbws.messageManager.on('message', handleUserMessage);
        }).catch(error => {
            console.error('Failed to set up message handler:', error);
        });
    }

    onRawMessage(handler: (userMessage: RawMessageForAgent) => void | Promise<void> | any | Promise<any>) {
        this.waitForReady().then(() => {
            const handleRawUserMessage = async (response: any) => {
                if (response.type != "messageResponse" && response.type != "providerStart" && response.type != "providerAgentStart") {
                    handler(response);
                }
            };
            cbws.messageManager.on('message', handleRawUserMessage);
        }).catch(error => {
            console.error('Failed to set up message handler:', error);
        });
    }

    /**
     * Sets up a listener for provider start events.
     * @param {Function} handler - The handler function to call when provider starts.
     * @returns {void}
     */
    onProviderStart(handler: (initvars: ProviderInitVars) => void | Promise<void> | any | Promise<any>) {
        this.waitForReady().then(() => {
            const handleProviderStart = async (response: { type: string; environmentName: string }) => {
                if (response.type === "providerStart") {
                    try {
                        const result = await handler(response || {});

                        const message: any = {
                            "type": "remoteProviderEvent",
                            "action": "providerStartResponse"
                        };

                        if (result !== undefined && result !== null) {
                            message.message = result;
                        }

                        cbws.messageManager.send(message);
                    } catch (error) {
                        console.error('Error in provider start handler:', error);
                        cbws.messageManager.send({
                            "type": "providerStartResponse",
                            "error": error instanceof Error ? error.message : "Unknown error occurred"
                        });
                    }
                }
            };

            cbws.messageManager.on('message', handleProviderStart);
        }).catch(error => {
            console.error('Failed to set up provider start handler:', error);
        });
    }

    /**
     * Sets up a listener for provider agent start events.
     * @param {Function} handler - The handler function to call when provider agent starts.
     * @returns {void}
     */
    onProviderAgentStart(handler: (userMessage: any) => void | Promise<void> | any | Promise<any>) {
        this.waitForReady().then(() => {
            const handleProviderAgentStart = async (response: any) => {
                console.log("Provider agent start event received");
                if (response.type === "providerAgentStart") {
                    try {

                        const result = await handler(response.userMessage);

                        const message: any = {
                            "type": "remoteProviderEvent",
                            "action": "providerAgentStartResponse"
                        };

                        if (result !== undefined && result !== null) {
                            message.message = result;
                        }

                        cbws.messageManager.send(message);
                    } catch (error) {
                        console.error('Error in provider agent start handler:', error);
                        cbws.messageManager.send({
                            "type": "remoteProviderEvent",
                            "action": "providerAgentStartResponse",
                            "error": error instanceof Error ? error.message : "Unknown error occurred"
                        });
                    }
                }
            };

            cbws.messageManager.on('message', handleProviderAgentStart);
        }).catch(error => {
            console.error('Failed to set up provider agent start handler:', error);
        });
    }

    /**
     * Sets up a listener for provider stop events.
     * @param {Function} handler - The handler function to call when provider stops.
     * @returns {void}
     */
    onProviderStop(handler: (initvars: ProviderInitVars) => void | Promise<void> | any | Promise<any>) {
        this.waitForReady().then(() => {
            const handleProviderStop = async (response: { type: string; environmentName: string }) => {
                if (response.type === "providerStop") {
                    try {
                        const result = await handler(response || {});

                        const message: any = {
                            "type": "remoteProviderEvent",
                            "action": "providerStopResponse",
                        };

                        if (result !== undefined && result !== null) {
                            message.message = result;
                        }

                        cbws.messageManager.send(message);
                    } catch (error) {
                        console.error('Error in provider stop handler:', error);
                        cbws.messageManager.send({
                            "type": "remoteProviderEvent",
                            "action": "providerStopResponse",
                            "error": error instanceof Error ? error.message : "Unknown error occurred"
                        });
                    }
                }
            };

            cbws.messageManager.on('message', handleProviderStop);
        }).catch(error => {
            console.error('Failed to set up provider stop handler:', error);
        });
    }

    /**
     * Sets up a listener for get diff files events.
     * @param {Function} handler - The handler function to call when diff files are requested.
     * @returns {void}
     */
    onGetDiffFiles(handler: () => void | Promise<void> | any | Promise<any>) {
        this.waitForReady().then(() => {
            const handleGetDiffFiles = async (response: any) => {
                console.log("Get diff files event received");
                if (response.type === "providerGetDiffFiles") {
                    try {
                        const result = await handler();

                        const message: any = {
                            "type": "remoteProviderEvent",
                            "action": "providerDiffFilesResponse",
                        };

                        if (result !== undefined && result !== null) {
                            message.message = result;
                        }

                        cbws.messageManager.send(message);
                    } catch (error) {
                        console.error('Error in get diff files handler:', error);
                        cbws.messageManager.send({
                            "type": "getDiffFiles",
                            "error": error instanceof Error ? error.message : "Unknown error occurred"
                        });
                    }
                }
            };

            cbws.messageManager.on('message', handleGetDiffFiles);
        }).catch(error => {
            console.error('Failed to set up get diff files handler:', error);
        });
    }

    /**
     * Sets up a listener for read file events.
     * @param {Function} handler - The handler function to call when read file is requested.
     * @returns {void}
     */
    onReadFile(handler: (path: string) => void | Promise<void> | any | Promise<any>) {
        this.waitForReady().then(() => {
            const handleReadFile = async (response: any) => {
                console.log("Read file event received");
                if (response.type === "providerReadFile") {
                    try {
                        const result = await handler(response.path);

                        const message: any = {
                            "type": "remoteProviderEvent",
                            "action": "providerReadFileResponse",
                        };

                        if (result !== undefined && result !== null) {
                            message.message = result;
                        }

                        cbws.messageManager.send(message);
                    } catch (error) {
                        console.error('Error in read file handler:', error);
                        cbws.messageManager.send({
                            "type": "remoteProviderEvent",
                            "action": "providerReadFileResponse",
                            "error": error instanceof Error ? error.message : "Unknown error occurred"
                        });
                    }
                }
            };

            cbws.messageManager.on('message', handleReadFile);
        }).catch(error => {
            console.error('Failed to set up read file handler:', error);
        });
    }

    /**
     * Sets up a listener for write file events.
     * @param {Function} handler - The handler function to call when write file is requested.
     * @returns {void}
     */
    onWriteFile(handler: (path: string, content: string) => void | Promise<void> | any | Promise<any>) {
        this.waitForReady().then(() => {
            const handleWriteFile = async (response: any) => {
                console.log("Write file event received");
                if (response.type === "providerWriteFile") {
                    try {
                        const result = await handler(response.path, response.content);

                        const message: any = {
                            "type": "remoteProviderEvent",
                            "action": "providerWriteFileResponse",
                        };

                        if (result !== undefined && result !== null) {
                            message.message = result;
                        }

                        cbws.messageManager.send(message);
                    } catch (error) {
                        console.error('Error in write file handler:', error);
                        cbws.messageManager.send({
                            "type": "remoteProviderEvent",
                            "action": "providerWriteFileResponse",
                            "error": error instanceof Error ? error.message : "Unknown error occurred"
                        });
                    }
                }
            };

            cbws.messageManager.on('message', handleWriteFile);
        }).catch(error => {
            console.error('Failed to set up write file handler:', error);
        });
    }

    /**
     * Sets up a listener for delete file events.
     * @param {Function} handler - The handler function to call when delete file is requested.
     * @returns {void}
     */
    onDeleteFile(handler: (path: string) => void | Promise<void> | any | Promise<any>) {
        this.waitForReady().then(() => {
            const handleDeleteFile = async (response: any) => {
                console.log("Delete file event received");
                if (response.type === "providerDeleteFile") {
                    try {
                        const result = await handler(response.path);

                        const message: any = {
                            "type": "remoteProviderEvent",
                            "action": "providerDeleteFileResponse",
                        };

                        if (result !== undefined && result !== null) {
                            message.message = result;
                        }

                        cbws.messageManager.send(message);
                    } catch (error) {
                        console.error('Error in delete file handler:', error);
                        cbws.messageManager.send({
                            "type": "remoteProviderEvent",
                            "action": "providerDeleteFileResponse",
                            "error": error instanceof Error ? error.message : "Unknown error occurred"
                        });
                    }
                }
            };

            cbws.messageManager.on('message', handleDeleteFile);
        }).catch(error => {
            console.error('Failed to set up delete file handler:', error);
        });
    }

    /**
     * Sets up a listener for delete folder events.
     * @param {Function} handler - The handler function to call when delete folder is requested.
     * @returns {void}
     */
    onDeleteFolder(handler: (path: string) => void | Promise<void> | any | Promise<any>) {
        this.waitForReady().then(() => {
            const handleDeleteFolder = async (response: any) => {
                console.log("Delete folder event received");
                if (response.type === "providerDeleteFolder") {
                    try {
                        const result = await handler(response.path);

                        const message: any = {
                            "type": "remoteProviderEvent",
                            "action": "providerDeleteFolderResponse",
                        };

                        if (result !== undefined && result !== null) {
                            message.message = result;
                        }

                        cbws.messageManager.send(message);
                    } catch (error) {
                        console.error('Error in delete folder handler:', error);
                        cbws.messageManager.send({
                            "type": "remoteProviderEvent",
                            "action": "providerDeleteFolderResponse",
                            "error": error instanceof Error ? error.message : "Unknown error occurred"
                        });
                    }
                }
            };

            cbws.messageManager.on('message', handleDeleteFolder);
        }).catch(error => {
            console.error('Failed to set up delete folder handler:', error);
        });
    }

    /**
     * Sets up a listener for rename item events.
     * @param {Function} handler - The handler function to call when rename item is requested.
     * @returns {void}
     */
    onRenameItem(handler: (oldPath: string, newPath: string) => void | Promise<void> | any | Promise<any>) {
        this.waitForReady().then(() => {
            const handleRenameItem = async (response: any) => {
                console.log("Rename item event received");
                if (response.type === "providerRenameItem") {
                    try {
                        const result = await handler(response.oldPath, response.newPath);

                        const message: any = {
                            "type": "remoteProviderEvent",
                            "action": "providerRenameItemResponse",
                        };

                        if (result !== undefined && result !== null) {
                            message.message = result;
                        }

                        cbws.messageManager.send(message);
                    } catch (error) {
                        console.error('Error in rename item handler:', error);
                        cbws.messageManager.send({
                            "type": "remoteProviderEvent",
                            "action": "providerRenameItemResponse",
                            "error": error instanceof Error ? error.message : "Unknown error occurred"
                        });
                    }
                }
            };

            cbws.messageManager.on('message', handleRenameItem);
        }).catch(error => {
            console.error('Failed to set up rename item handler:', error);
        });
    }

    /**
     * Sets up a listener for create folder events.
     * @param {Function} handler - The handler function to call when create folder is requested.
     * @returns {void}
     */
    onCreateFolder(handler: (path: string) => void | Promise<void> | any | Promise<any>) {
        this.waitForReady().then(() => {
            const handleCreateFolder = async (response: any) => {
                console.log("Create folder event received");
                if (response.type === "providerCreateFolder") {
                    try {
                        const result = await handler(response.path);

                        const message: any = {
                            "type": "remoteProviderEvent",
                            "action": "providerCreateFolderResponse",
                        };

                        if (result !== undefined && result !== null) {
                            message.message = result;
                        }

                        cbws.messageManager.send(message);
                    } catch (error) {
                        console.error('Error in create folder handler:', error);
                        cbws.messageManager.send({
                            "type": "remoteProviderEvent",
                            "action": "providerCreateFolderResponse",
                            "error": error instanceof Error ? error.message : "Unknown error occurred"
                        });
                    }
                }
            };

            cbws.messageManager.on('message', handleCreateFolder);
        }).catch(error => {
            console.error('Failed to set up create folder handler:', error);
        });
    }

    /**
     * Sets up a listener for copy file events.
     * @param {Function} handler - The handler function to call when copy file is requested.
     * @returns {void}
     */
    onCopyFile(handler: (sourcePath: string, destinationPath: string) => void | Promise<void> | any | Promise<any>) {
        this.waitForReady().then(() => {
            const handleCopyFile = async (response: any) => {
                console.log("Copy file event received");
                if (response.type === "providerCopyFile") {
                    try {
                        const result = await handler(response.sourcePath, response.destinationPath);

                        const message: any = {
                            "type": "remoteProviderEvent",
                            "action": "providerCopyFileResponse",
                        };

                        if (result !== undefined && result !== null) {
                            message.message = result;
                        }

                        cbws.messageManager.send(message);
                    } catch (error) {
                        console.error('Error in copy file handler:', error);
                        cbws.messageManager.send({
                            "type": "remoteProviderEvent",
                            "action": "providerCopyFileResponse",
                            "error": error instanceof Error ? error.message : "Unknown error occurred"
                        });
                    }
                }
            };

            cbws.messageManager.on('message', handleCopyFile);
        }).catch(error => {
            console.error('Failed to set up copy file handler:', error);
        });
    }

    /**
     * Sets up a listener for copy folder events.
     * @param {Function} handler - The handler function to call when copy folder is requested.
     * @returns {void}
     */
    onCopyFolder(handler: (sourcePath: string, destinationPath: string) => void | Promise<void> | any | Promise<any>) {
        this.waitForReady().then(() => {
            const handleCopyFolder = async (response: any) => {
                console.log("Copy folder event received");
                if (response.type === "providerCopyFolder") {
                    try {
                        const result = await handler(response.sourcePath, response.destinationPath);

                        const message: any = {
                            "type": "remoteProviderEvent",
                            "action": "providerCopyFolderResponse",
                        };

                        if (result !== undefined && result !== null) {
                            message.message = result;
                        }

                        cbws.messageManager.send(message);
                    } catch (error) {
                        console.error('Error in copy folder handler:', error);
                        cbws.messageManager.send({
                            "type": "remoteProviderEvent",
                            "action": "providerCopyFolderResponse",
                            "error": error instanceof Error ? error.message : "Unknown error occurred"
                        });
                    }
                }
            };

            cbws.messageManager.on('message', handleCopyFolder);
        }).catch(error => {
            console.error('Failed to set up copy folder handler:', error);
        });
    }

    /**
     * Sets up a listener for get full project events.
     * @param {Function} handler - The handler function to call when get full project is requested.
     * @returns {void}
     */
    onGetFullProject(handler: () => void | Promise<void> | any | Promise<any>) {
        this.waitForReady().then(() => {
            const handleGetFullProject = async (response: any) => {
                console.log("Get full project event received");
                if (response.type === "providerGetFullProject") {
                    try {
                        const result = await handler();

                        const message: any = {
                            "type": "remoteProviderEvent",
                            "action": "providerGetFullProjectResponse",
                        };

                        if (result !== undefined && result !== null) {
                            message.message = result;
                        }

                        cbws.messageManager.send(message);
                    } catch (error) {
                        console.error('Error in get full project handler:', error);
                        cbws.messageManager.send({
                            "type": "remoteProviderEvent",
                            "action": "providerGetFullProjectResponse",
                            "error": error instanceof Error ? error.message : "Unknown error occurred"
                        });
                    }
                }
            };

            cbws.messageManager.on('message', handleGetFullProject);
        }).catch(error => {
            console.error('Failed to set up get full project handler:', error);
        });
    }

    /**
     * Sets up a listener for close signal events.
     * @param {Function} handler - The handler function to call when close signal is received.
     * @returns {void}
     */
    onCloseSignal(handler: () => void | Promise<void> | any | Promise<any>) {
        this.waitForReady().then(() => {
            const handleCloseSignal = async (response: any) => {
                console.log("Close signal event received");
                if (response.type === "closeSignal") {
                    try {
                        const result = await handler();

                        const message: any = {
                            "type": "closeSignalResponse"
                        };

                        if (result !== undefined && result !== null) {
                            message.message = result;
                        }

                        cbws.messageManager.send(message);
                    } catch (error) {
                        console.error('Error in close signal handler:', error);
                        cbws.messageManager.send({
                            "type": "closeSignalResponse",
                            "error": error instanceof Error ? error.message : "Unknown error occurred"
                        });
                    }
                }
            };

            cbws.messageManager.on('message', handleCloseSignal);
        }).catch(error => {
            console.error('Failed to set up close signal handler:', error);
        });
    }

    /**
     * Sets up a listener for create patch request events.
     * @param {Function} handler - The handler function to call when patch request is created.
     * @returns {void}
     */
    onCreatePatchRequest(handler: () => void | Promise<void> | any | Promise<any>) {
        this.waitForReady().then(() => {
            const handleCreatePatchRequest = async (response: any) => {
                console.log("Create patch request event received");
                if (response.type === "createPatchRequest") {
                    try {
                        const result = await handler();

                        const message: any = {
                            "type": "createPatchRequestResponse"
                        };

                        if (result !== undefined && result !== null) {
                            message.message = result;
                        }

                        cbws.messageManager.send(message);
                    } catch (error) {
                        console.error('Error in create patch request handler:', error);
                        cbws.messageManager.send({
                            "type": "createPatchRequestResponse",
                            "error": error instanceof Error ? error.message : "Unknown error occurred"
                        });
                    }
                }
            };

            cbws.messageManager.on('message', handleCreatePatchRequest);
        }).catch(error => {
            console.error('Failed to set up create patch request handler:', error);
        });
    }

    /**
     * Sets up a listener for create pull request events.
     * @param {Function} handler - The handler function to call when pull request is created.
     * @returns {void}
     */
    onCreatePullRequestRequest(handler: () => void | Promise<void> | any | Promise<any>) {
        this.waitForReady().then(() => {
            const handleCreatePullRequestRequest = async (response: any) => {
                console.log("Create pull request event received");
                if (response.type === "createPullRequestRequest") {
                    try {
                        const result = await handler();

                        const message: any = {
                            "type": "createPullRequestRequestResponse"
                        };

                        if (result !== undefined && result !== null) {
                            message.message = result;
                        }

                        cbws.messageManager.send(message);
                    } catch (error) {
                        console.error('Error in create pull request handler:', error);
                        cbws.messageManager.send({
                            "type": "createPullRequestRequestResponse",
                            "error": error instanceof Error ? error.message : "Unknown error occurred"
                        });
                    }
                }
            };

            cbws.messageManager.on('message', handleCreatePullRequestRequest);
        }).catch(error => {
            console.error('Failed to set up create pull request handler:', error);
        });
    }

    /**
     * Sets up a listener for merge as patch events.
     * @param {Function} handler - The handler function to call when merge as patch is requested.
     * @returns {void}
     */
    onMergeAsPatch(handler: () => void | Promise<void> | any | Promise<any>) {
        this.waitForReady().then(() => {
            const handleMergeAsPatch = async (response: any) => {
                console.log("Merge as patch event received");
                if (response.type === "providerMergeAsPatch") {
                    try {
                        const result = await handler();

                        const message: any = {
                            "type": "remoteProviderEvent",
                            "action": "providerMergeAsPatchResponse",
                        };

                        if (result !== undefined && result !== null) {
                            message.message = result;
                        }

                        cbws.messageManager.send(message);
                    } catch (error) {
                        console.error('Error in merge as patch handler:', error);
                        cbws.messageManager.send({
                            "type": "remoteProviderEvent",
                            "action": "providerMergeAsPatchResponse",
                            "error": error instanceof Error ? error.message : "Unknown error occurred"
                        });
                    }
                }
            };

            cbws.messageManager.on('message', handleMergeAsPatch);
        }).catch(error => {
            console.error('Failed to set up merge as patch handler:', error);
        });
    }

    /**
     * Sets up a listener for send PR events.
     * @param {Function} handler - The handler function to call when send PR is requested.
     * @returns {void}
     */
    onSendPR(handler: () => void | Promise<void> | any | Promise<any>) {
        this.waitForReady().then(() => {
            const handleSendPR = async (response: any) => {
                console.log("Send PR event received");
                if (response.type === "providerSendPR") {
                    try {
                        const result = await handler();

                        const message: any = {
                            "type": "remoteProviderEvent",
                            "action": "providerSendPRResponse",
                        };

                        if (result !== undefined && result !== null) {
                            message.message = result;
                        }

                        cbws.messageManager.send(message);
                    } catch (error) {
                        console.error('Error in send PR handler:', error);
                        cbws.messageManager.send({
                            "type": "remoteProviderEvent",
                            "action": "providerSendPRResponse",
                            "error": error instanceof Error ? error.message : "Unknown error occurred"
                        });
                    }
                }
            };

            cbws.messageManager.on('message', handleSendPR);
        }).catch(error => {
            console.error('Failed to set up send PR handler:', error);
        });
    }

    /**
     * Sets up a listener for get tree children events.
     * @param {Function} handler - The handler function to call when tree children are requested.
     * @returns {void}
     */
    onGetTreeChildren(handler: (path: string) => void | Promise<void> | any | Promise<any>) {
        this.waitForReady().then(() => {
            const handleGetTreeChildren = async (response: any) => {
                console.log("Get tree children event received");
                if (response.type === "providerGetTreeChildren") {
                    try {
                        const result = await handler(response.path);

                        const message: any = {
                            "type": "remoteProviderEvent",
                            "action": "providerGetTreeChildrenResponse",
                        };

                        if (result !== undefined && result !== null) {
                            message.message = result;
                        }

                        cbws.messageManager.send(message);
                    } catch (error) {
                        console.error('Error in get tree children handler:', error);
                        cbws.messageManager.send({
                            "type": "remoteProviderEvent",
                            "action": "providerGetTreeChildrenResponse",
                            "error": error instanceof Error ? error.message : "Unknown error occurred"
                        });
                    }
                }
            };

            cbws.messageManager.on('message', handleGetTreeChildren);
        }).catch(error => {
            console.error('Failed to set up get tree children handler:', error);
        });
    }
}

export default Codebolt; 