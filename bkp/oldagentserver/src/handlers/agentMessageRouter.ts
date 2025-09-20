import { ClientConnection, Message, ReadFileMessage, WriteFileMessage, AskAIMessage, ResponseMessage, formatLogMessage } from '@codebolt/types/remote';
import { 
  ReadFileHandler, 
  WriteFileHandler, 
  AskAIHandler, 
  ResponseHandler,
  CreateFileHandler,
  CreateFolderHandler,
  UpdateFileHandler,
  DeleteFileHandler,
  DeleteFolderHandler,
  FileListHandler,
  SearchFilesHandler,
  FileSearchHandler,
  GrepSearchHandler,
  ListCodeDefinitionNamesHandler,
  EditFileWithDiffHandler,
  TerminalHandler,
  GitHandler,
  BrowserHandler,
  LlmHandler,
  TaskHandler,
  VectorDbHandler,
  MemoryHandler,
  DebugHandler,
  CrawlerHandler,
  ProjectHandler,
  ChatHandler,
  StateHandler,
  McpHandler,
  AgentHandler,
  TokenizerHandler,
  HistoryHandler,
  CodeUtilsHandler,
  UtilsHandler,
  CodebaseSearchHandler
} from './appMessageHandlers/index.js';
import { ConnectionManager } from '../core/connectionManager.js';
import { NotificationService } from '../services/NotificationService.js';
import { SendMessageToApp } from './sendMessageToApp.js';
import type { 
  ReadFileEvent,
  CreateFileEvent,
  CreateFolderEvent,
  UpdateFileEvent,
  DeleteFileEvent,
  DeleteFolderEvent,
  FileListEvent,
  ListCodeDefinitionNamesEvent,
  SearchFilesEvent,
  WriteToFileEvent,
  GrepSearchEvent,
  FileSearchEvent,
  EditFileWithDiffEvent,
  TerminalEvent,
  BrowserEvent,
  GitEvent,
  LLMEvent,
  TaskEvent,
  VectordbEvent,
  MemoryEvent,
  DebugEvent,
  CrawlerEvent,
  ProjectEvent,
  ChatEvent,
  StateEvent,
  McpEvent,
  AgentEvent,
  TokenizerEvent,
  HistoryEvent,
  UtilsEvent,
  CodeUtilsEvent
} from '@codebolt/types/agent-to-app-ws-types';
import type { 
  FileReadRequestNotification, 
  FileReadResponseNotification, 
  FileCreateRequestNotification,
  FileCreateResponseNotification,
  FolderCreateRequestNotification,
  FolderCreateResponseNotification,
  FileEditRequestNotification,
  FileEditResponseNotification,
  FileDeleteRequestNotification,
  FileDeleteResponseNotification,
  FolderDeleteRequestNotification,
  FolderDeleteResponseNotification,
  WriteToFileRequestNotification,
  WriteToFileResponseNotification,
  // Git Notifications
  GitNotificationBase,
  // Browser Notifications  
  BrowserNotificationBase,
  // Terminal Notifications
  TerminalNotificationBase,
  // LLM Notifications
  LlmNotificationBase,
  // Todo Notifications (tasks are handled as todos)
  TodoNotificationBase,
  // Memory Notifications
  DbMemoryNotificationBase,
  // Debug Notifications
  SystemNotificationBase,
  // Crawler Notifications
  CrawlerNotificationBase,
  // Chat Notifications
  ChatNotificationBase,
  // Agent Notifications
  AgentNotificationBase,
  // History Notifications
  HistoryNotificationBase,
  // CodeUtils Notifications
  CodeUtilsNotificationBase,
  // MCP Notifications
  McpNotificationBase
} from '@codebolt/types/agent-to-app-ws-types';

/**
 * Routes messages with explicit workflow visibility
 * Shows the complete message flow and notifications
 */
export class AgentMessageRouter {
  private readFileHandler: ReadFileHandler;
  private writeFileHandler: WriteFileHandler;
  private askAIHandler: AskAIHandler;
  private createFileHandler: CreateFileHandler;
  private createFolderHandler: CreateFolderHandler;
  private updateFileHandler: UpdateFileHandler;
  private deleteFileHandler: DeleteFileHandler;
  private deleteFolderHandler: DeleteFolderHandler;
  private fileListHandler: FileListHandler;
  private searchFilesHandler: SearchFilesHandler;
  private fileSearchHandler: FileSearchHandler;
  private grepSearchHandler: GrepSearchHandler;
  private listCodeDefinitionNamesHandler: ListCodeDefinitionNamesHandler;
  private editFileWithDiffHandler: EditFileWithDiffHandler;
  private terminalHandler: TerminalHandler;
  private gitHandler: GitHandler;
  private browserHandler: BrowserHandler;
  private llmHandler: LlmHandler;
  private taskHandler: TaskHandler;
  private vectorDbHandler: VectorDbHandler;
  private memoryHandler: MemoryHandler;
  private debugHandler: DebugHandler;
  private crawlerHandler: CrawlerHandler;
  private projectHandler: ProjectHandler;
  private chatHandler: ChatHandler;
  private stateHandler: StateHandler;
  private mcpHandler: McpHandler;
  private agentHandler: AgentHandler;
  private tokenizerHandler: TokenizerHandler;
  private historyHandler: HistoryHandler;
  private codeUtilsHandler: CodeUtilsHandler;
  private utilsHandler: UtilsHandler;
  private codebaseSearchHandler: CodebaseSearchHandler;
  private sendMessageToApp:SendMessageToApp
  private connectionManager: ConnectionManager;
  private notificationService: NotificationService;




  constructor() {
 
    this.readFileHandler = new ReadFileHandler();
    this.writeFileHandler = new WriteFileHandler();
    this.askAIHandler = new AskAIHandler();
    this.createFileHandler = new CreateFileHandler();
    this.createFolderHandler = new CreateFolderHandler();
    this.updateFileHandler = new UpdateFileHandler();
    this.deleteFileHandler = new DeleteFileHandler();
    this.deleteFolderHandler = new DeleteFolderHandler();
    this.fileListHandler = new FileListHandler();
    this.searchFilesHandler = new SearchFilesHandler();
    this.fileSearchHandler = new FileSearchHandler();
    this.grepSearchHandler = new GrepSearchHandler();
    this.listCodeDefinitionNamesHandler = new ListCodeDefinitionNamesHandler();
    this.editFileWithDiffHandler = new EditFileWithDiffHandler();
    this.terminalHandler = new TerminalHandler();
    this.gitHandler = new GitHandler();
    this.browserHandler = new BrowserHandler();
    this.llmHandler = new LlmHandler();
    this.taskHandler = new TaskHandler();
    this.vectorDbHandler = new VectorDbHandler();
    this.memoryHandler = new MemoryHandler();
    this.debugHandler = new DebugHandler();
    this.crawlerHandler = new CrawlerHandler();
    this.projectHandler = new ProjectHandler();
    this.chatHandler = new ChatHandler();
    this.stateHandler = new StateHandler();
    this.mcpHandler = new McpHandler();
    this.agentHandler = new AgentHandler();
    this.tokenizerHandler = new TokenizerHandler();
    this.historyHandler = new HistoryHandler();
    this.codeUtilsHandler = new CodeUtilsHandler();
    this.utilsHandler = new UtilsHandler();
    this.codebaseSearchHandler = new CodebaseSearchHandler();
    this.sendMessageToApp= new SendMessageToApp()
    this.connectionManager = ConnectionManager.getInstance();
    this.notificationService = NotificationService.getInstance();
  }

 

 

  /**
   * Handle requests from agents (asking app to do file operations)
   * This method implements the functionality of fsService.handleFsEvents within the switch cases
   */
  async handleAgentRequest(agent: ClientConnection, message: Message | any) {
    console.log(formatLogMessage('info', 'MessageRouter', `Handling agent request: ${message.type || message.action} from ${agent.id}`));
    
    // Handle all typed events from agents
    const action = message.action || message.type;
    
    switch (action) {
      // File System Events
      case 'readFile':
        this.readFileHandler.handleReadFile(agent, message as ReadFileEvent);
        break;
      case 'createFile':
        this.createFileHandler.handleCreateFile(agent, message as CreateFileEvent);
        break;
      case 'createFolder':
        this.createFolderHandler.handleCreateFolder(agent, message as CreateFolderEvent);
        break;
      case 'updateFile':
        this.updateFileHandler.handleUpdateFile(agent, message as UpdateFileEvent);
        break;
      case 'deleteFile':
        this.deleteFileHandler.handleDeleteFile(agent, message as DeleteFileEvent);
        break;
      case 'deleteFolder':
        this.deleteFolderHandler.handleDeleteFolder(agent, message as DeleteFolderEvent);
        break;
      case 'fileList':
        this.fileListHandler.handleFileList(agent, message as FileListEvent);
        break;
      case 'listCodeDefinitionNames':
        this.listCodeDefinitionNamesHandler.handleListCodeDefinitionNames(agent, message as ListCodeDefinitionNamesEvent);
        break;
      case 'searchFiles':
        this.searchFilesHandler.handleSearchFiles(agent, message as SearchFilesEvent);
        break;
      case 'writeToFile':
        this.writeFileHandler.handleWriteToFile(agent, message as WriteToFileEvent);
        break;
      case 'grep_search':
        this.grepSearchHandler.handleGrepSearch(agent, message as GrepSearchEvent);
        break;
      case 'file_search':
        this.fileSearchHandler.handleFileSearch(agent, message as FileSearchEvent);
        break;
      case 'edit_file_with_diff':
        this.editFileWithDiffHandler.handleEditFileWithDiff(agent, message as EditFileWithDiffEvent);
        break;
      case 'editFileAndApplyDiff':
        this.utilsHandler.handleUtilsEvent(agent, message as UtilsEvent);
        break;
      case 'codebase_search':
        this.codebaseSearchHandler.handleCodebaseSearch(agent, message as any);
        break;

      // // Git Events
      // case 'Init':
      // case 'Pull':
      // case 'Push':
      // case 'Status':
      // case 'Add':
      // case 'Commit':
      // case 'Checkout':
      // case 'gitBranch':
      // case 'gitLogs':
      // case 'Diff':
      // case 'gitDiff':
      // case 'Clone':
      //   this.gitHandler.handleGitEvent(agent, message as GitEvent);
      //   break;

      // // Browser Events
      // case 'newPage':
      // case 'getUrl':
      // case 'goToPage':
      // case 'screenshot':
      // case 'getHTML':
      // case 'getMarkdown':
      // case 'getPDF':
      // case 'pdfToText':
      // case 'getContent':
      // case 'getSnapShot':
      // case 'getBrowserInfo':
      // case 'extractText':
      // case 'close':
      // case 'scroll':
      // case 'type':
      // case 'click':
      // case 'enter':
      // case 'search':
      //   this.browserHandler.handleBrowserEvent(agent, message as BrowserEvent);
      //   break;

      // // Terminal Events (these use type field instead of action)
      // case 'executeCommand':
      // case 'executeCommandRunUntilError':
      // case 'executeCommandWithStream':
      // case 'sendInterruptToTerminal':
      //   this.terminalHandler.handleTerminalEvent(agent, message as TerminalEvent);
      //   break;

      // // LLM Events (these use type field)
      // case 'inference':
      //   this.llmHandler.handleLlmEvent(agent, message as LLMEvent);
      //   break;

      // // Task Events
      // case 'addTask':
      // case 'getTasks':
      // case 'getTasksByAgent':
      // case 'getTasksByCategory':
      // case 'getAllAgents':
      // case 'updateTask':
      // case 'deleteTask':
      // case 'addSubTask':
      // case 'updateSubTask':
      // case 'deleteSubTask':
      // case 'createTasksFromMarkdown':
      // case 'exportTasksToMarkdown':
      //   this.taskHandler.handleTaskEvent(agent, message as TaskEvent);
      //   break;

      // // VectorDB Events
      // case 'getVector':
      // case 'addVectorItem':
      // case 'queryVectorItem':
      // case 'queryVectorItems':
      //   this.vectorDbHandler.handleVectorDbEvent(agent, message as VectordbEvent);
      //   break;

      // // Memory Events
      // case 'set':
      // case 'get':
      //   this.memoryHandler.handleMemoryEvent(agent, message as MemoryEvent);
      //   break;

      // // Debug Events
      // case 'addLog':
      // case 'openDebugBrowser':
      //   this.debugHandler.handleDebugEvent(agent, message as DebugEvent);
      //   break;

      // // Crawler Events
      // case 'start':
      //   this.crawlerHandler.handleCrawlerEvent(agent, message as CrawlerEvent);
      //   break;

      // // Project Events
      // case 'getProjectSettings':
      // case 'getProjectPath':
      // case 'getRepoMap':
      // case 'getEditorFileStatus':
      // case 'runProject':
      //   this.projectHandler.handleProjectEvent(agent, message as ProjectEvent);
      //   break;

      // // Chat Events (these use type field)
      // case 'getChatHistory':
      // case 'processStoped':
      // case 'processStarted':
      // case 'processFinished':
      // case 'sendMessage':
      // case 'waitforReply':
      // case 'confirmationRequest':
      // case 'notificationEvent':
      //   this.chatHandler.handleChatEvent(agent, message as ChatEvent);
      //   break;

      // // State Events (these use type field)
      // case 'projectStateEvent':
      // case 'agentStateEvent':
      // case 'getAppState':
      // case 'addToAgentState':
      // case 'getAgentState':
      // case 'getProjectState':
      // case 'updateProjectState':
      //   this.stateHandler.handleStateEvent(agent, message as StateEvent);
      //   break;

      // // MCP Events
      // case 'getEnabledToolBoxes':
      // case 'getLocalToolBoxes':
      // case 'getAvailableToolBoxes':
      // case 'searchAvailableToolBoxes':
      // case 'listToolsFromToolBoxes':
      // case 'configureToolBox':
      // case 'getTools':
      // case 'executeTool':
      //   this.mcpHandler.handleMcpEvent(agent, message as McpEvent);
      //   break;

      // // Agent Events
      // case 'findAgent':
      // case 'startAgent':
      // case 'listAgents':
      // case 'agentsDetail':
      //   this.agentHandler.handleAgentEvent(agent, message as AgentEvent);
      //   break;

      // // Tokenizer Events
      // case 'addToken':
      // case 'getToken':
      //   this.tokenizerHandler.handleTokenizerEvent(agent, message as TokenizerEvent);
      //   break;

      // // History Events
      // case 'summarizeAll':
      // case 'summarize':
      //   this.historyHandler.handleHistoryEvent(agent, message as HistoryEvent);
      //   break;

      // // CodeUtils Events (these use type field)
      // case 'codeEvent':
      //   this.codeUtilsHandler.handleCodeUtilsEvent(agent, message as CodeUtilsEvent);
      //   break;

      default: 
      let data= await this.notificationService.sendToAppRelatedToAgentId(agent.id,message,true);
      this.connectionManager.sendToConnection(agent.id, { ...data, clientId: agent.id });
        // console.warn(formatLogMessage('warn', 'MessageRouter', `Unhandled action: ${action} from ${agent.id}`));
        break;
    }
  }
}