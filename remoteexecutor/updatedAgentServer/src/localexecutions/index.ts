import { ClientConnection, Message } from "../types";
import type {
  ReadFileEvent as SchemaReadFileEvent,
  WriteToFileEvent as SchemaWriteToFileEvent,
  DeleteFileEvent as SchemaDeleteFileEvent,
  GrepSearchEvent as SchemaGrepSearchEvent,
  McpEvent,
  LLMEvent,
  GetChatHistoryEvent,
  ProjectEvent,
  SendMessageEvent,
  GitEvent,
} from "@codebolt/types/agent-to-app-ws-types";

import { ReadFileHandler } from "./file/readFileHandler";
import { WriteFileHandler } from "./file/writeFileHandler";
import { ListDirectoryHandler } from "./file/listDirectoryHandler";
import { ReadManyFilesHandler } from "./file/readManyFilesHandler";
import { SmartEditHandler } from "./file/smartEditHandler";
import { ToolHandler } from "./toolHandler";
import { AIRequesteHandler } from "./llmRequestHandler";
import { ChatHistoryHandler } from "./chatHistoryHandler";
import { ProjectRequestHandler } from "./projectRequestHandler";
import { ChatMessageHandler } from "./chatMessageHandler";
import { GitHandler } from "./git";
import { ActionBlockHandler } from "./actionBlockHandler";
import { TerminalHandler } from "./terminal/terminalHandler";
import { sideExecutionManager } from "./managers/SideExecutionManager";
import type { ActionBlockRequest } from "../types/sideExecution";
import { logger } from "../main/utils/logger";

// Re-export handlers and permission manager
export { ReadFileHandler } from "./file/readFileHandler";
export { WriteFileHandler } from "./file/writeFileHandler";
export { ToolHandler } from "./toolHandler";
export { PermissionManager, PermissionUtils } from "./PermissionManager";
export type {
  PermissionScope,
  PermissionRule,
  PermissionPolicy,
  TrustedFolder,
  PermissionStorage
} from "./PermissionManager";

// Define interfaces that match what the handlers expect
interface ReadFileEvent {
  type: "fsEvent";
  action: "readFile";
  requestId: string;
  message: {
    relPath: string;
    offset?: number;
    limit?: number;
  };
}

interface WriteToFileEvent {
  type: "fsEvent";
  action: "writeToFile";
  requestId: string;
  message: {
    relPath: string;
    newContent: string;
  };
}

// ActionBlockComplete message type
interface ActionBlockCompleteMessage {
  type: "actionBlockComplete";
  sideExecutionId: string;
  result?: any;
  error?: string;
}

// Message type union for executeActionOnMessage
export type AgentMessage = Message |
  SchemaReadFileEvent |
  SchemaWriteToFileEvent |
  SchemaDeleteFileEvent |
  SchemaGrepSearchEvent |
  McpEvent |
  LLMEvent |
  GetChatHistoryEvent |
  ProjectEvent |
  SendMessageEvent |
  GitEvent |
  ActionBlockRequest |
  ActionBlockCompleteMessage;

// Handlers container to avoid recreating instances
class LocalExecutionHandlers {
  private static instance: LocalExecutionHandlers;

  public readFileHandler: ReadFileHandler;
  public writeFileHandler: WriteFileHandler;
  public listDirectoryHandler: ListDirectoryHandler;
  public readManyFilesHandler: ReadManyFilesHandler;
  public smartEditHandler: SmartEditHandler;
  public toolHandler: ToolHandler;
  public llmRequestHandler: AIRequesteHandler;
  public chatHistoryHandler: ChatHistoryHandler;
  public projectRequestHandler: ProjectRequestHandler;
  public chatMessageRequestHandler: ChatMessageHandler;
  public gitHandler: GitHandler;
  public actionBlockHandler: ActionBlockHandler;
  public terminalHandler: TerminalHandler;

  private constructor() {
    this.readFileHandler = new ReadFileHandler();
    this.writeFileHandler = new WriteFileHandler();
    this.listDirectoryHandler = new ListDirectoryHandler();
    this.readManyFilesHandler = new ReadManyFilesHandler();
    this.smartEditHandler = new SmartEditHandler();
    this.toolHandler = new ToolHandler();
    this.llmRequestHandler = new AIRequesteHandler();
    this.chatHistoryHandler = new ChatHistoryHandler();
    this.projectRequestHandler = new ProjectRequestHandler();
    this.chatMessageRequestHandler = new ChatMessageHandler();
    this.gitHandler = new GitHandler();
    this.actionBlockHandler = new ActionBlockHandler();
    this.terminalHandler = new TerminalHandler();
  }

  public static getInstance(): LocalExecutionHandlers {
    if (!LocalExecutionHandlers.instance) {
      LocalExecutionHandlers.instance = new LocalExecutionHandlers();
    }
    return LocalExecutionHandlers.instance;
  }
}

/**
 * Execute action on message locally based on message type
 * @param agent - The client connection
 * @param message - The message to process
 * @returns true if the message was handled locally, false otherwise
 */
export const executeActionOnMessage = async (
  agent: ClientConnection,
  message: AgentMessage
): Promise<boolean> => {
  const handlers = LocalExecutionHandlers.getInstance();

  if (message.type === "fsEvent" && message.action === "readFile") {
    const schemaMessage = message as SchemaReadFileEvent;
    // Convert schema-based event to handler-based event
    const readFileEvent: ReadFileEvent = {
      type: "fsEvent",
      action: "readFile",
      requestId: message.requestId ?? '',
      message: {
        relPath: schemaMessage.message?.filePath ?? '',
        // offset and limit are not in the schema, so we leave them undefined
      }
    };
    await handlers.readFileHandler.handleReadFile(agent, readFileEvent);
    return true;
  }

  if (message.type === "fsEvent" && (message as any).action === "createFile") {
    const msg = message as any;
    const writeFileEvent: WriteToFileEvent = {
      type: "fsEvent",
      action: "writeToFile",
      requestId: msg.requestId ?? '',
      message: {
        relPath: msg.message?.filePath ?? '',
        newContent: msg.message?.content ?? '',
      }
    };
    await handlers.writeFileHandler.handleWriteFile(agent, writeFileEvent);
    return true;
  }

  if (message.type === "fsEvent" && message.action === "writeToFile") {
    const schemaMessage = message as SchemaWriteToFileEvent;
    // Convert schema-based event to handler-based event
    const writeFileEvent: WriteToFileEvent = {
      type: "fsEvent",
      action: "writeToFile",
      requestId: message.requestId ?? '',
      message: {
        relPath: schemaMessage.message?.relPath ?? '',
        newContent: schemaMessage.message?.newContent ?? '',
      }
    };
    await handlers.writeFileHandler.handleWriteFile(agent, writeFileEvent);
    return true;
  }

  if (message.type === "fsEvent" && (message as any).action === "list_directory") {
    const msg = message as any;
    const listDirEvent = {
      type: "fsEvent" as const,
      action: "listDirectory" as const,
      requestId: msg.requestId ?? '',
      message: {
        path: msg.message?.path ?? '',
      }
    };
    await handlers.listDirectoryHandler.handleListDirectory(agent, listDirEvent);
    return true;
  }

  if (message.type === "fsEvent" && (message as any).action === "readManyFiles") {
    const msg = message as any;
    const readManyEvent = {
      type: "fsEvent" as const,
      action: "readManyFiles" as const,
      requestId: msg.requestId ?? '',
      message: {
        paths: msg.message?.paths ?? [],
      }
    };
    await handlers.readManyFilesHandler.handleReadManyFiles(agent, readManyEvent);
    return true;
  }

  if (message.type === "fsEvent" && (message as any).action === "smartEdit") {
    const msg = message as any;
    const smartEditEvent = {
      type: "fsEvent" as const,
      action: "smartEdit" as const,
      requestId: msg.requestId ?? '',
      message: {
        filePath: msg.message?.filePath ?? '',
        prompt: msg.message?.prompt ?? '',
        oldString: msg.message?.oldString ?? '',
        newString: msg.message?.newString ?? '',
        expectedReplacements: msg.message?.expectedReplacements,
      }
    };
    await handlers.smartEditHandler.handleSmartEdit(agent, smartEditEvent);
    return true;
  }

  if (message.type === "codebolttools") {
    await handlers.toolHandler.handleToolEvent(agent, message);
    return true;
  }

  if (message.type === 'inference') {
    await handlers.llmRequestHandler.handleAiRequest(agent, message);
    return true;
  }

  if (message.type === 'getChatHistory') {
    await handlers.chatHistoryHandler.handleChatHistoryEvent(agent, message as GetChatHistoryEvent);
    return true;
  }

  if (message.type === 'projectEvent') {
    await handlers.projectRequestHandler.handleProjectEvent(agent, message as ProjectEvent);
    return true;
  }

  if (message.type === 'sendMessage') {
    await handlers.chatMessageRequestHandler.handleChatMessageRequest(agent, message as SendMessageEvent);
    return true;
  }

  if (message.type === 'gitEvent') {
    await handlers.gitHandler.handleGitEvent(agent, message as GitEvent);
    return true;
  }

  // Terminal events — actual message.type values from SDK
  const terminalTypes = ['executeCommand', 'executeCommandRunUntilError', 'executeCommandRunUntilInterrupt', 'executeCommandWithStream', 'sendInterruptToTerminal'];
  if (terminalTypes.includes(message.type as string)) {
    await handlers.terminalHandler.handleTerminalEvent(agent, message as any);
    return true;
  }

  if (message.type === 'actionBlock') {
    await handlers.actionBlockHandler.handleActionBlockEvent(agent, message as ActionBlockRequest);
    return true;
  }

  // Handle actionBlockComplete messages from side executions
  if (message.type === 'actionBlockComplete') {
    const completeMessage = message as ActionBlockCompleteMessage;
    logger.info(`[executeActionOnMessage] Routing actionBlockComplete for: ${completeMessage.sideExecutionId}`);
    sideExecutionManager.handleActionBlockComplete({
      sideExecutionId: completeMessage.sideExecutionId,
      result: completeMessage.result,
      error: completeMessage.error
    });
    return true;
  }

  // Message type not handled locally
  return false;
};
