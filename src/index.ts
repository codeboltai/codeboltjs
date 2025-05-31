import cbws from './modules/websocket';
import cbfs from './modules/fs';
import cbllm from './modules/llm';
import cbterminal from './modules/terminal';
import cbbrowser from './modules/browser';
import cbchat from './modules/chat';
import cbcodeutils from './modules/codeutils';
import cbdocutils from './modules/docutils';
import cbcrawler from './modules/crawler';
import cbsearch from './modules/search';
import cbknowledge from './modules/knowledge';
import cbrag from './modules/rag';
import cbcodeparsers from './modules/codeparsers';
import cboutputparsers from './modules/outputparsers';
import cbproject from './modules/project';
import git from './modules/git';
import dbmemory from './modules/dbmemory';
import cbstate from './modules/state';
import task from './modules/task';
import vectorDB from './modules/vectordb';
import debug from './modules/debug'
import tokenizer from './modules/tokenizer'
import WebSocket from 'ws';
import { EventEmitter } from 'events';
import {chatSummary} from './modules/history'
import codeboltTools from './modules/tools';
import cbagent from './modules/agent';
import cbutils from './modules/utils';



/**
 * @class Codebolt
 * @description This class provides a unified interface to interact with various modules.
 */
class Codebolt  {

    /**
     * @constructor
     * @description Initializes the websocket connection.
     */
    constructor() {
        cbws.initializeWebSocket()
        this.websocket = cbws.getWebsocket;
         
    }
    
    /**
     * @method waitForConnection
     * @description Waits for the WebSocket connection to open.
     * @returns {Promise<void>} A promise that resolves when the WebSocket connection is open.
     */
    async waitForConnection() {
        return new Promise<void>((resolve, reject) => {
            if (!this.websocket) {
                reject(new Error('WebSocket is not initialized'));
                return;
            }

            if (this.websocket.readyState === WebSocket.OPEN) {
                resolve();
                return;
            }

            this.websocket.addEventListener('open', () => {
                resolve();
            });

            this.websocket.addEventListener('error', (error) => {
                reject(error);
            });

        });
    }

    websocket: WebSocket | null = null;
    fs = cbfs;
    git = git;
    llm = cbllm;
    browser = cbbrowser;
    chat = cbchat;
    terminal = cbterminal;
    codeutils = cbcodeutils;
    docutils = cbdocutils;
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
    chatSummary=chatSummary;
    tools = codeboltTools;
    agent = cbagent;
    utils = cbutils;
  
    /**
     * Sets up a listener for incoming user messages with a direct handler function.
     * @param {Function} handler - The handler function to call when a user message is received.
     * @returns {void}
     */
    onUserMessage(handler: (userMessage: any) => void | Promise<void> | any | Promise<any>) {
        const waitForConnection = () => {
            if (cbws.getWebsocket) {
                cbws.getWebsocket.on('message', async (data: string) => {
                    const response = JSON.parse(data);
                    if (response.type === "messageResponse") {
                        try {
                            const result = await handler(response);
                            // Send processStoped with optional message
                            const message: any = {
                                "type": "processStoped"
                            };
                            
                            // If handler returned data, include it as message
                            if (result !== undefined && result !== null) {
                                message.message = result;
                            }
                            
                            cbws.getWebsocket.send(JSON.stringify(message));
                        } catch (error) {
                            console.error('Error in user message handler:', error);
                            // Send processStoped even if there's an error
                            cbws.getWebsocket.send(JSON.stringify({
                                "type": "processStoped",
                                "error": error instanceof Error ? error.message : "Unknown error occurred"
                            }));
                        }
                    }
                });
            } else {
                setTimeout(waitForConnection, 100);
            }
        };

        waitForConnection();
    }
}

export default new Codebolt();



