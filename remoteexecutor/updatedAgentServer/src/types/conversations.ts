import { ModelOption } from './models';

export interface AgentSelection {
  id: string;
  name: string;
  agentType?: string;
  agentDetails?: string;
  [key: string]: any;
}

export interface ConversationOptions {
  selectedModel?: ModelOption | null;
  selectedAgent?: AgentSelection | null;
}

export interface ConversationMessage {
  type: string;
  content: string;
  timestamp?: string;
  metadata?: Record<string, any> | null;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ConversationMessage[];
  options?: ConversationOptions;
}

export interface ConversationInsertRequest {
  projectPath?: string;
  conversation: Conversation;
}

export interface ConversationResponse {
  success: boolean;
  conversation?: Conversation;
  error?: string;
}
