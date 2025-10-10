/**
 * Chat SDK Function Types
 * Types for the cbchat module functions
 */

import { MessageObject } from "./llm";
enum AgentTypeEnum {
  marketplace = 'marketplace',
  localZip = 'local-zip',
  localPath = 'local-path',
  serverZip = 'server-zip'

}

// Base response interface for chat operations
export interface BaseChatSDKResponse {
  success?: boolean;
  message?: string;
  error?: string;
  type: string
}

// Chat message interfaces
export interface ChatMessage extends BaseChatSDKResponse {
  threadId: string,
  messages: MessageObject[]
}

// Full UserMessage structure as received from WebSocket
export interface UserMessage {
  type: string;
  message: FlatUserMessage,
  sender: {
    senderType: string;
    senderInfo: Record<string, any>;
  };
  templateType: string;
  data: {
    text: string;
    [key: string]: any;
  };
  messageId: string;
  timestamp: string;
}

// Flattened UserMessage structure as used in SDK functions
export interface FlatUserMessage {
  userMessage: string;
  currentFile: string;
  selectedAgent: {
    id: string;
    name: string;
    lastMessage?: Record<string, any>;
    agentType?: AgentTypeEnum;
    agentDetails?:string
  };
  mentionedFiles: string[];
  mentionedFullPaths: string[];
  mentionedFolders: string[];
  mentionedMultiFile?: string[];
  mentionedMCPs: string[];
  uploadedImages: string[];
  actions?: any[];
  mentionedAgents: any[];
  mentionedDocs?: any[];
  links?: any[];
  universalAgentLastMessage?: string;
  selection: any | null;
  controlFiles?: any[];
  feedbackMessage?: string;
  terminalMessage?: string;
  messageId: string;
  threadId: string;
  templateType?: string;
  processId?: string;
  shadowGitHash?: string;
  remixPrompt?: any;
  activeFile: string;
  openedFiles: string[]

}

// Chat history responses
export interface GetChatHistoryResponse extends BaseChatSDKResponse {
  messages?: Array<{
    id: string;
    content: string;
    sender: string;
    timestamp: string;
    type: string;
  }>;
  agentId?: string;
}

export interface ChatSummaryResponse extends BaseChatSDKResponse {
  summary?: string;
  messageCount?: number;
  agentId?: string;
}
