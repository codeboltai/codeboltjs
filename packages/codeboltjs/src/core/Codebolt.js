"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const websocket_1 = __importDefault(require("./websocket"));
const fs_1 = __importDefault(require("../modules/fs"));
const llm_1 = __importDefault(require("../modules/llm"));
const terminal_1 = __importDefault(require("../modules/terminal"));
const browser_1 = __importDefault(require("../modules/browser"));
const chat_1 = __importDefault(require("../modules/chat"));
const codeutils_1 = __importDefault(require("../modules/codeutils"));
const crawler_1 = __importDefault(require("../modules/crawler"));
const search_1 = __importDefault(require("../modules/search"));
const knowledge_1 = __importDefault(require("../modules/knowledge"));
const rag_1 = __importDefault(require("../modules/rag"));
const codeparsers_1 = __importDefault(require("../modules/codeparsers"));
const outputparsers_1 = __importDefault(require("../modules/outputparsers"));
const project_1 = __importDefault(require("../modules/project"));
const git_1 = __importDefault(require("../modules/git"));
const dbmemory_1 = __importDefault(require("../modules/dbmemory"));
const state_1 = __importDefault(require("../modules/state"));
const task_1 = __importDefault(require("../modules/task"));
const vectordb_1 = __importDefault(require("../modules/vectordb"));
const debug_1 = __importDefault(require("../modules/debug"));
const tokenizer_1 = __importDefault(require("../modules/tokenizer"));
const history_1 = require("../modules/history");
const mcp_1 = __importDefault(require("../modules/mcp"));
const agent_1 = __importDefault(require("../modules/agent"));
const utils_1 = __importDefault(require("../modules/utils"));
const notificationfunctions_1 = require("../notificationfunctions");
const user_message_manager_1 = require("../modules/user-message-manager");
const user_message_utilities_1 = require("../modules/user-message-utilities");
/**
 * @class Codebolt
 * @description This class provides a unified interface to interact with various modules.
 */
class Codebolt {
    /**
     * @constructor
     * @description Initializes the websocket connection.
     */
    constructor() {
        this.websocket = null;
        this.isReady = false;
        this.readyHandlers = [];
        this.fs = fs_1.default;
        this.git = git_1.default;
        this.llm = llm_1.default;
        this.browser = browser_1.default;
        this.chat = chat_1.default;
        this.terminal = terminal_1.default;
        this.codeutils = codeutils_1.default;
        this.crawler = crawler_1.default;
        this.search = search_1.default;
        this.knowledge = knowledge_1.default;
        this.rag = rag_1.default;
        this.codeparsers = codeparsers_1.default;
        this.outputparsers = outputparsers_1.default;
        this.project = project_1.default;
        this.dbmemory = dbmemory_1.default;
        this.cbstate = state_1.default;
        this.taskplaner = task_1.default;
        this.vectordb = vectordb_1.default;
        this.debug = debug_1.default;
        this.tokenizer = tokenizer_1.default;
        this.chatSummary = history_1.chatSummary;
        this.mcp = mcp_1.default;
        this.agent = agent_1.default;
        this.utils = utils_1.default;
        this.notify = notificationfunctions_1.notificationFunctions;
        /**
         * User message utilities for accessing current user message and context
         */
        this.userMessage = user_message_utilities_1.userMessageUtilities;
        console.log("Codebolt Agent initialized");
        this.readyPromise = this.initializeConnection();
    }
    /**
     * @method initializeConnection
     * @description Initializes the WebSocket connection asynchronously.
     * @private
     */
    async initializeConnection() {
        try {
            await websocket_1.default.initializeWebSocket();
            this.websocket = websocket_1.default.getWebsocket;
            this.isReady = true;
            console.log("Codebolt WebSocket connection established");
            // Execute all registered ready handlers
            for (const handler of this.readyHandlers) {
                try {
                    await handler();
                }
                catch (error) {
                    console.error('Error executing ready handler:', error);
                }
            }
        }
        catch (error) {
            console.error('Failed to initialize WebSocket connection:', error);
            throw error;
        }
    }
    /**
     * @method waitForReady
     * @description Waits for the Codebolt instance to be fully initialized.
     * @returns {Promise<void>} A promise that resolves when the instance is ready.
     */
    async waitForReady() {
        return this.readyPromise;
    }
    /**
     * @method isReady
     * @description Checks if the Codebolt instance is ready for use.
     * @returns {boolean} True if the instance is ready, false otherwise.
     */
    get ready() {
        return this.isReady;
    }
    /**
     * Sets up a handler function to be executed when the WebSocket connection is established.
     * If the connection is already established, the handler will be executed immediately.
     * @param {Function} handler - The handler function to call when the connection is ready.
     * @returns {void}
     */
    onReady(handler) {
        if (this.isReady) {
            // If already ready, execute the handler immediately
            try {
                const result = handler();
                if (result instanceof Promise) {
                    result.catch(error => {
                        console.error('Error in ready handler:', error);
                    });
                }
            }
            catch (error) {
                console.error('Error in ready handler:', error);
            }
        }
        else {
            // If not ready yet, add to the list of handlers to execute when ready
            this.readyHandlers.push(handler);
        }
    }
    /**
     * Sets up a listener for incoming messages with a direct handler function.
     * @param {Function} handler - The handler function to call when a message is received.
     * @returns {void}
     */
    onMessage(handler) {
        // Wait for the WebSocket to be ready before setting up the handler
        this.waitForReady().then(() => {
            const handleUserMessage = async (response) => {
                var _a, _b;
                console.log("Message received By Agent Library Starting Custom Agent Handler Logic");
                if (response.type === "messageResponse") {
                    try {
                        // Extract user-facing message from internal socket message
                        const userMessage = {
                            userMessage: response.message.userMessage,
                            currentFile: response.message.currentFile,
                            mentionedFiles: response.message.mentionedFiles || [],
                            mentionedFullPaths: response.message.mentionedFullPaths || [],
                            mentionedFolders: response.message.mentionedFolders || [],
                            uploadedImages: response.message.uploadedImages || [],
                            mentionedMCPs: response.message.mentionedMCPs || [],
                            selectedAgent: {
                                id: ((_a = response.message.selectedAgent) === null || _a === void 0 ? void 0 : _a.id) || '',
                                name: ((_b = response.message.selectedAgent) === null || _b === void 0 ? void 0 : _b.name) || ''
                            },
                            messageId: response.message.messageId,
                            threadId: response.message.threadId,
                            selection: response.message.selection,
                            remixPrompt: response.message.remixPrompt,
                            mentionedAgents: response.message.mentionedAgents || []
                        };
                        // Automatically save the user message globally
                        user_message_manager_1.userMessageManager.saveMessage(userMessage);
                        const result = await handler(userMessage);
                        // Send processStoped with optional message
                        const message = {
                            "type": "processStoped"
                        };
                        // If handler returned data, include it as message
                        if (result !== undefined && result !== null) {
                            message.message = result;
                        }
                        websocket_1.default.messageManager.send(message);
                    }
                    catch (error) {
                        console.error('Error in user message handler:', error);
                        // Send processStoped even if there's an error
                        websocket_1.default.messageManager.send({
                            "type": "processStoped",
                            "error": error instanceof Error ? error.message : "Unknown error occurred"
                        });
                    }
                }
            };
            websocket_1.default.messageManager.on('message', handleUserMessage);
        }).catch(error => {
            console.error('Failed to set up message handler:', error);
        });
    }
}
exports.default = Codebolt;
