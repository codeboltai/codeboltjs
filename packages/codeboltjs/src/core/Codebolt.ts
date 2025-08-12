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
import cbcodeparsers from '../modules/codeparsers';
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
import cbagent from '../modules/agent';
import cbutils from '../modules/utils';
import { notificationFunctions, type NotificationFunctions } from '../notificationfunctions';
import type { UserMessage } from '../types/libFunctionTypes';
import { userMessageManager } from '../modules/user-message-manager';
import { userMessageUtilities } from '../modules/user-message-utilities';

/**
 * @class Codebolt
 * @description This class provides a unified interface to interact with various modules.
 */
class Codebolt {
    websocket: WebSocket | null = null;
    private isReady: boolean = false;
    private readyPromise: Promise<void>;
    private readyHandlers: Array<() => void | Promise<void>> = [];

    /**
     * @constructor
     * @description Initializes the websocket connection.
     */
    constructor() {
        console.log("Codebolt Agent initialized");
        this.readyPromise = this.initializeConnection();
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
    browser = cbbrowser;
    chat = cbchat;
    terminal = cbterminal;
    codeutils = cbcodeutils;
    crawler = cbcrawler;
    search = cbsearch;
    knowledge = cbknowledge;
    rag = cbrag;
    codeparsers = cbcodeparsers;
    outputparsers = cboutputparsers;
    project = cbproject;
    dbmemory = dbmemory;
    cbstate = cbstate;
    taskplaner = task;
    vectordb = vectorDB;
    debug = debug;
    tokenizer = tokenizer;
    chatSummary = chatSummary;
    mcp = codeboltTools;
    agent = cbagent;
    utils = cbutils;
    notify = notificationFunctions;
    
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
     * Sets up a listener for incoming messages with a direct handler function.
     * @param {Function} handler - The handler function to call when a message is received.
     * @returns {void}
     */
    onMessage(handler: (userMessage: UserMessage) => void | Promise<void> | any | Promise<any>) {
        // Wait for the WebSocket to be ready before setting up the handler
        this.waitForReady().then(() => {
            const handleUserMessage = async (response: any) => {
                console.log("Message received By Agent Library Starting Custom Agent Handler Logic");
                if (response.type === "messageResponse") {
                    try {
                        // Extract user-facing message from internal socket message
                        const userMessage: UserMessage = {
                            type: response.type,
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
                            remixPrompt:response.message.remixPrompt,
                            mentionedAgents:response.message.mentionedAgents
                        };

                        // Automatically save the user message globally
                        userMessageManager.saveMessage(userMessage);

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
}

export default Codebolt; 