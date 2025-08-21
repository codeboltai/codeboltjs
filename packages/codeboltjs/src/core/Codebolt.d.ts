import WebSocket from 'ws';
import { type NotificationFunctions } from '../notificationfunctions';
import type { FlatUserMessage } from '@codebolt/types/sdk';
/**
 * @class Codebolt
 * @description This class provides a unified interface to interact with various modules.
 */
declare class Codebolt {
    websocket: WebSocket | null;
    private isReady;
    private readyPromise;
    private readyHandlers;
    /**
     * @constructor
     * @description Initializes the websocket connection.
     */
    constructor();
    /**
     * @method initializeConnection
     * @description Initializes the WebSocket connection asynchronously.
     * @private
     */
    private initializeConnection;
    /**
     * @method waitForReady
     * @description Waits for the Codebolt instance to be fully initialized.
     * @returns {Promise<void>} A promise that resolves when the instance is ready.
     */
    waitForReady(): Promise<void>;
    /**
     * @method isReady
     * @description Checks if the Codebolt instance is ready for use.
     * @returns {boolean} True if the instance is ready, false otherwise.
     */
    get ready(): boolean;
    fs: {
        createFile: (fileName: string, source: string, filePath: string) => Promise<FlatUserMessage>;
        createFolder: (folderName: string, folderPath: string) => Promise<FlatUserMessage>;
        readFile: (filePath: string) => Promise<FlatUserMessage>;
        updateFile: (filename: string, filePath: string, newContent: string) => Promise<FlatUserMessage>;
        deleteFile: (filename: string, filePath: string) => Promise<FlatUserMessage>;
        deleteFolder: (foldername: string, folderpath: string) => Promise<FlatUserMessage>;
        listFile: (folderPath: string, isRecursive?: boolean) => Promise<FlatUserMessage>;
        listCodeDefinitionNames: (path: string) => Promise<FlatUserMessage>;
        searchFiles: (path: string, regex: string, filePattern: string) => Promise<FlatUserMessage>;
        writeToFile: (relPath: string, newContent: string) => Promise<any>;
        grepSearch: (path: string, query: string, includePattern?: string, excludePattern?: string, caseSensitive?: boolean) => Promise<FlatUserMessage>;
        fileSearch: (query: string) => Promise<FlatUserMessage>;
        editFileWithDiff: (targetFile: string, codeEdit: string, diffIdentifier: string, prompt: string, applyModel?: string) => Promise<FlatUserMessage>;
    };
    git: {
        init: (path: string) => Promise<FlatUserMessage>;
        pull: () => Promise<FlatUserMessage>;
        push: () => Promise<FlatUserMessage>;
        status: () => Promise<FlatUserMessage>;
        addAll: () => Promise<FlatUserMessage>;
        commit: (message: string) => Promise<FlatUserMessage>;
        checkout: (branch: string) => Promise<FlatUserMessage>;
        branch: (branch: string) => Promise<FlatUserMessage>;
        logs: (path: string) => Promise<FlatUserMessage>;
        diff: (commitHash: string) => Promise<FlatUserMessage>;
    };
    llm: {
        inference: (params: {
            messages: FlatUserMessage[];
            tools?: FlatUserMessage[];
            tool_choice?: string;
            full?: boolean;
            llmrole?: string;
            max_tokens?: number;
            temperature?: number;
            stream?: boolean;
        }, llmrole?: string) => Promise<{
            completion: FlatUserMessage;
        }>;
        legacyInference: (message: string, llmrole: string) => Promise<FlatUserMessage>;
    };
    browser: {
        newPage: () => Promise<FlatUserMessage>;
        getUrl: () => Promise<FlatUserMessage>;
        goToPage: (url: string) => Promise<FlatUserMessage>;
        screenshot: () => Promise<FlatUserMessage>;
        getHTML: () => Promise<FlatUserMessage>;
        getMarkdown: () => Promise<FlatUserMessage>;
        getPDF: () => void;
        pdfToText: () => void;
        getContent: () => Promise<FlatUserMessage>;
        getSnapShot: () => Promise<FlatUserMessage>;
        getBrowserInfo: () => Promise<FlatUserMessage>;
        extractText: () => Promise<FlatUserMessage>;
        close: () => void;
        scroll: (direction: string, pixels: string) => Promise<FlatUserMessage>;
        type: (elementid: string, text: string) => Promise<FlatUserMessage>;
        click: (elementid: string) => Promise<FlatUserMessage>;
        enter: () => Promise<FlatUserMessage>;
        search: (elementid: string, query: string) => Promise<FlatUserMessage>;
    };
    chat: {
        getChatHistory: () => Promise<FlatUserMessage[]>;
        setRequestHandler: (handler: (request: any, response: (data: any) => void) => Promise<void> | void) => void;
        sendMessage: (message: string, payload: any) => void;
        waitforReply: (message: string) => Promise<FlatUserMessage>;
        processStarted: (onStopClicked?: (message: any) => void) => {
            stopProcess: () => void;
            cleanup: () => void;
        } | {
            stopProcess: () => void;
            cleanup?: undefined;
        };
        stopProcess: () => void;
        processFinished: () => void;
        sendConfirmationRequest: (confirmationMessage: string, buttons?: string[], withFeedback?: boolean) => Promise<string>;
        askQuestion: (question: string, buttons?: string[], withFeedback?: boolean) => Promise<string>;
        sendNotificationEvent: (notificationMessage: string, type: "debug" | "git" | "planner" | "browser" | "editor" | "terminal" | "preview") => void;
    };
    terminal: {
        eventEmitter: {
            cleanup?: () => void;
            [EventEmitter.captureRejectionSymbol]?<K>(error: Error, event: string | symbol, ...args: any[]): void;
            addListener<K>(eventName: string | symbol, listener: (...args: any[]) => void): /*elided*/ any;
            on<K>(eventName: string | symbol, listener: (...args: any[]) => void): /*elided*/ any;
            once<K>(eventName: string | symbol, listener: (...args: any[]) => void): /*elided*/ any;
            removeListener<K>(eventName: string | symbol, listener: (...args: any[]) => void): /*elided*/ any;
            off<K>(eventName: string | symbol, listener: (...args: any[]) => void): /*elided*/ any;
            removeAllListeners(eventName?: string | symbol | undefined): /*elided*/ any;
            setMaxListeners(n: number): /*elided*/ any;
            getMaxListeners(): number;
            listeners<K>(eventName: string | symbol): Function[];
            rawListeners<K>(eventName: string | symbol): Function[];
            emit<K>(eventName: string | symbol, ...args: any[]): boolean;
            listenerCount<K>(eventName: string | symbol, listener?: Function | undefined): number;
            prependListener<K>(eventName: string | symbol, listener: (...args: any[]) => void): /*elided*/ any;
            prependOnceListener<K>(eventName: string | symbol, listener: (...args: any[]) => void): /*elided*/ any;
            eventNames(): (string | symbol)[];
        };
        executeCommand: (command: string, returnEmptyStringOnSuccess?: boolean) => Promise<any>;
        executeCommandRunUntilError: (command: string, executeInMain?: boolean) => Promise<FlatUserMessage>;
        sendManualInterrupt(): Promise<FlatUserMessage>;
        executeCommandWithStream(command: string, executeInMain?: boolean): {
            cleanup?: () => void;
            [EventEmitter.captureRejectionSymbol]?<K>(error: Error, event: string | symbol, ...args: any[]): void;
            addListener<K>(eventName: string | symbol, listener: (...args: any[]) => void): /*elided*/ any;
            on<K>(eventName: string | symbol, listener: (...args: any[]) => void): /*elided*/ any;
            once<K>(eventName: string | symbol, listener: (...args: any[]) => void): /*elided*/ any;
            removeListener<K>(eventName: string | symbol, listener: (...args: any[]) => void): /*elided*/ any;
            off<K>(eventName: string | symbol, listener: (...args: any[]) => void): /*elided*/ any;
            removeAllListeners(eventName?: string | symbol | undefined): /*elided*/ any;
            setMaxListeners(n: number): /*elided*/ any;
            getMaxListeners(): number;
            listeners<K>(eventName: string | symbol): Function[];
            rawListeners<K>(eventName: string | symbol): Function[];
            emit<K>(eventName: string | symbol, ...args: any[]): boolean;
            listenerCount<K>(eventName: string | symbol, listener?: Function | undefined): number;
            prependListener<K>(eventName: string | symbol, listener: (...args: any[]) => void): /*elided*/ any;
            prependOnceListener<K>(eventName: string | symbol, listener: (...args: any[]) => void): /*elided*/ any;
            eventNames(): (string | symbol)[];
        };
    };
    codeutils: {
        getJsTree: (filePath?: string) => Promise<import("../types/InternalTypes").JSTreeResponse>;
        getAllFilesAsMarkDown: () => Promise<string>;
        performMatch: (matcherDefinition: object, problemPatterns: any[], problems?: any[]) => Promise<FlatUserMessage>;
        getMatcherList: () => Promise<FlatUserMessage>;
        matchDetail: (matcher: string) => Promise<FlatUserMessage>;
    };
    crawler: {
        start: () => void;
        screenshot: () => void;
        goToPage: (url: string) => void;
        scroll: (direction: string) => void;
        click: (id: string) => Promise<any>;
    };
    search: {
        init: (engine?: string) => void;
        search: (query: string) => Promise<string>;
        get_first_link: (query: string) => Promise<string>;
    };
    knowledge: {};
    rag: {
        init: () => void;
        add_file: (filename: string, file_path: string) => void;
        retrieve_related_knowledge: (query: string, filename: string) => void;
    };
    codeparsers: {
        getClassesInFile: (file: string) => Promise<{
            error: string;
        } | {
            name: any;
            location: string;
        }[]>;
        getFunctionsinClass: (file: string, className: string) => Promise<{
            error: string;
        } | {
            name: string;
            class: string;
            location: string;
        }[]>;
        getAstTreeInFile: (file: string, className?: string) => Promise<import("..").ASTNode | {
            error: string;
        }>;
    };
    outputparsers: {
        parseJSON: (jsonString: string) => import("../modules/outputparsers").ParseResult<unknown>;
        parseXML: (xmlString: string) => import("../modules/outputparsers").ParseResult<{
            rootElement: string;
            [key: string]: unknown;
        }>;
        parseCSV: (csvString: string) => import("../modules/outputparsers").ParseResult<import("../modules/outputparsers").CSVRow[]>;
        parseText: (text: string) => import("../modules/outputparsers").ParseResult<string[]>;
        parseErrors: (output: import("../modules/outputparsers").ParsableOutput) => string[];
        parseWarnings: (output: import("../modules/outputparsers").ParsableOutput) => string[];
    };
    project: {
        getProjectSettings: () => Promise<FlatUserMessage>;
        getProjectPath: () => Promise<FlatUserMessage>;
        getRepoMap: (message: any) => Promise<FlatUserMessage>;
        runProject: () => void;
        getEditorFileStatus: () => Promise<any>;
    };
    dbmemory: {
        addKnowledge: (key: string, value: FlatUserMessage) => Promise<FlatUserMessage>;
        getKnowledge: (key: string) => Promise<FlatUserMessage>;
    };
    cbstate: {
        getApplicationState: () => Promise<import("../types/commonTypes").ApplicationState>;
        addToAgentState: (key: string, value: string) => Promise<FlatUserMessage>;
        getAgentState: () => Promise<FlatUserMessage>;
        getProjectState: () => Promise<FlatUserMessage>;
        updateProjectState: (key: string, value: any) => Promise<FlatUserMessage>;
    };
    taskplaner: {
        addTask: (params: import("../types/libFunctionTypes").TaskCreateOptions) => Promise<import("../types/commonTypes").TaskResponse>;
        addSimpleTask: (task: string, agentId?: string) => Promise<import("../types/commonTypes").TaskResponse>;
        getTasks: (filters?: import("../types/libFunctionTypes").TaskFilterOptions) => Promise<import("../types/commonTypes").TaskResponse>;
        getTasksByAgent: (agentId: string) => Promise<import("../types/commonTypes").TaskResponse>;
        getTasksByCategory: (category: string) => Promise<import("../types/commonTypes").TaskResponse>;
        getAllAgents: () => Promise<import("../types/commonTypes").TaskResponse>;
        updateTask: (params: import("../types/libFunctionTypes").TaskUpdateOptions) => Promise<import("../types/commonTypes").TaskResponse>;
        updateSimpleTask: (taskId: string, task: string) => Promise<import("../types/commonTypes").TaskResponse>;
        deleteTask: (taskId: string) => Promise<import("../types/commonTypes").TaskResponse>;
        addSubTask: (params: import("../types/libFunctionTypes").AddSubTaskOptions) => Promise<import("../types/commonTypes").TaskResponse>;
        updateSubTask: (params: import("../types/libFunctionTypes").UpdateSubTaskOptions) => Promise<import("../types/commonTypes").TaskResponse>;
        deleteSubTask: (taskId: string, subtaskId: string) => Promise<import("../types/commonTypes").TaskResponse>;
        createTasksFromMarkdown: (params: import("../types/libFunctionTypes").TaskMarkdownImportOptions) => Promise<import("../types/commonTypes").TaskResponse>;
        exportTasksToMarkdown: (params?: import("../types/libFunctionTypes").TaskMarkdownExportOptions) => Promise<import("../types/commonTypes").TaskResponse>;
        toggleTaskCompletion: (taskId: string, completed: boolean) => Promise<import("../types/commonTypes").TaskResponse>;
        toggleSubTaskCompletion: (taskId: string, subtaskId: string, completed: boolean) => Promise<import("../types/commonTypes").TaskResponse>;
        moveTaskToAgent: (taskId: string, newAgentId: string) => Promise<import("../types/commonTypes").TaskResponse>;
        setTaskPriority: (taskId: string, priority: "low" | "medium" | "high") => Promise<import("../types/commonTypes").TaskResponse>;
        addTaskTags: (taskId: string, tags: string[]) => Promise<import("../types/commonTypes").TaskResponse>;
        createQuickTask: (title: string, agentId?: string, category?: string) => Promise<import("../types/commonTypes").TaskResponse>;
    };
    vectordb: {
        getVector: (key: string) => Promise<FlatUserMessage>;
        addVectorItem: (item: any) => Promise<FlatUserMessage>;
        queryVectorItem: (key: string) => Promise<FlatUserMessage>;
        queryVectorItems: (items: [], dbPath: string) => Promise<FlatUserMessage>;
    };
    debug: {
        debug: (log: string, type: import("../modules/debug").logType) => Promise<FlatUserMessage>;
        openDebugBrowser: (url: string, port: number) => Promise<FlatUserMessage>;
    };
    tokenizer: {
        addToken: (key: string) => Promise<FlatUserMessage>;
        getToken: (key: string) => Promise<FlatUserMessage>;
    };
    chatSummary: {
        summarizeAll: () => Promise<FlatUserMessage>;
        summarize: (messages: {
            role: string;
            content: string;
        }[], depth: number) => Promise<FlatUserMessage>;
    };
    mcp: {
        getEnabledMCPServers: () => Promise<FlatUserMessage>;
        getLocalMCPServers: () => Promise<FlatUserMessage>;
        getMentionedMCPServers: (userMessage: FlatUserMessage) => Promise<FlatUserMessage>;
        searchAvailableMCPServers: (query: string) => Promise<FlatUserMessage>;
        listMcpFromServers: (toolBoxes: string[]) => Promise<FlatUserMessage>;
        configureMCPServer: (name: string, config: FlatUserMessage) => Promise<FlatUserMessage>;
        getTools: (tools: {
            toolbox: string;
            toolName: string;
        }[]) => Promise<FlatUserMessage>;
        executeTool: (toolbox: string, toolName: string, params: FlatUserMessage) => Promise<FlatUserMessage>;
    };
    agent: {
        findAgent: (task: string, maxResult: number | undefined, agents: never[] | undefined, agentLocaltion: FlatUserMessage, getFrom: FlatUserMessage) => Promise<FlatUserMessage>;
        startAgent: (agentId: string, task: string) => Promise<FlatUserMessage>;
        getAgentsList: (type?: FlatUserMessage) => Promise<FlatUserMessage>;
        getAgentsDetail: (agentList?: never[]) => Promise<FlatUserMessage>;
    };
    utils: {
        editFileAndApplyDiff: (filePath: string, diff: string, diffIdentifier: string, prompt: string, applyModel?: string) => Promise<FlatUserMessage>;
    };
    notify: NotificationFunctions;
    /**
     * User message utilities for accessing current user message and context
     */
    userMessage: {
        getCurrent: () => any;
        getText: () => string;
        getMentionedMCPs: () => string[];
        getMentionedFiles: () => string[];
        getMentionedFolders: () => string[];
        getMentionedAgents: () => any[];
        getRemixPrompt: () => string | undefined;
        getUploadedImages: () => any[];
        getCurrentFile: () => string | undefined;
        getSelection: () => string | undefined;
        getMessageId: () => string | undefined;
        getThreadId: () => string | undefined;
        getProcessingConfig: () => AgentProcessingConfig;
        isProcessingEnabled: (type: "processMentionedMCPs" | "processRemixPrompt" | "processMentionedFiles" | "processMentionedAgents") => boolean;
        setSessionData: (key: string, value: any) => void;
        getSessionData: (key: string) => any;
        getTimestamp: () => string | undefined;
        hasMessage: () => boolean;
        updateProcessingConfig: (config: any) => void;
        clear: () => void;
    };
    /**
     * Sets up a handler function to be executed when the WebSocket connection is established.
     * If the connection is already established, the handler will be executed immediately.
     * @param {Function} handler - The handler function to call when the connection is ready.
     * @returns {void}
     */
    onReady(handler: () => void | Promise<void>): void;
    /**
     * Sets up a listener for incoming messages with a direct handler function.
     * @param {Function} handler - The handler function to call when a message is received.
     * @returns {void}
     */
    onMessage(handler: (userMessage: FlatUserMessage) => void | Promise<void> | any | Promise<any>): void;
}
export default Codebolt;
