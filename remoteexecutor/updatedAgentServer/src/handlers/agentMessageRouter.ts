import { ClientConnection, Message, ReadFileMessage, WriteFileMessage, AskAIMessage, ResponseMessage, formatLogMessage } from '@codebolt/shared-types';
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
   
    // Forward the message to the related app instead of sending back to client
    this.sendMessageToApp.forwardToApp(agent, message);

    
    // switch (action) {
    //   // File System Events
    //   case 'readFile':
    //     this.readFileHandler.handleReadFile(agent, message as ReadFileEvent);
    //     break;
    //   case 'createFile':
    //     this.createFileHandler.handleCreateFile(agent, message as CreateFileEvent);
    //     break;
    //   case 'createFolder':
    //     this.createFolderHandler.handleCreateFolder(agent, message as CreateFolderEvent);
    //     break;
    //   case 'updateFile':
    //     this.updateFileHandler.handleUpdateFile(agent, message as UpdateFileEvent);
    //     break;
    //   case 'deleteFile':
    //     this.deleteFileHandler.handleDeleteFile(agent, message as DeleteFileEvent);
    //     break;
    //   case 'deleteFolder':
    //     this.deleteFolderHandler.handleDeleteFolder(agent, message as DeleteFolderEvent);
    //     break;
    //   case 'fileList':
    //     this.fileListHandler.handleFileList(agent, message as FileListEvent);
    //     break;
    //   case 'listCodeDefinitionNames':
    //     this.listCodeDefinitionNamesHandler.handleListCodeDefinitionNames(agent, message as ListCodeDefinitionNamesEvent);
    //     break;
    //   case 'searchFiles':
    //     this.searchFilesHandler.handleSearchFiles(agent, message as SearchFilesEvent);
    //     break;
    //   case 'writeToFile':
    //     this.writeFileHandler.handleWriteToFile(agent, message as WriteToFileEvent);
    //     break;
    //   case 'grep_search':
    //     this.grepSearchHandler.handleGrepSearch(agent, message as GrepSearchEvent);
    //     break;
    //   case 'file_search':
    //     this.fileSearchHandler.handleFileSearch(agent, message as FileSearchEvent);
    //     break;
    //   case 'edit_file_with_diff':
    //     this.editFileWithDiffHandler.handleEditFileWithDiff(agent, message as EditFileWithDiffEvent);
    //     break;
    //   case 'editFileAndApplyDiff':
    //     this.utilsHandler.handleUtilsEvent(agent, message as UtilsEvent);
    //     break;
    //   case 'codebase_search':
    //     this.codebaseSearchHandler.handleCodebaseSearch(agent, message as any);
    //     break;
    //   default: 
    //   let data= await this.notificationService.sendToAppRelatedToAgentId(agent.id,message,true);
    //   this.connectionManager.sendToConnection(agent.id, { ...data, clientId: agent.id });
    //     // console.warn(formatLogMessage('warn', 'MessageRouter', `Unhandled action: ${action} from ${agent.id}`));
    //     break;
    // }
  }
}