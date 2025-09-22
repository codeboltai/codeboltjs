/**
 * Base interface for all messages
 */
export interface BaseMessage {
  id: string;
  type: string;
  clientId?: string;
}

/**
 * Message for registering a client or agent
 */
export interface RegisterMessage extends BaseMessage {
  type: 'register';
  clientType: 'client' | 'agent';
}

/**
 * Message for reading a file
 */
export interface ReadFileMessage extends BaseMessage {
  type: 'readfile';
  filepath: string;
}

/**
 * Message for writing a file
 */
export interface WriteFileMessage extends BaseMessage {
  type: 'writefile';
  filepath: string;
  content: string;
}

/**
 * Message for AI requests
 */
export interface AskAIMessage extends BaseMessage {
  type: 'askAI';
  prompt: string;
}

/**
 * Response message from server or agent
 */
export interface ResponseMessage extends BaseMessage {
  type: 'messageResponse';
  success: boolean;
  data?: any;
  error?: string;
  originalRequest?: unknown;
}



/**
 * Connection establishment message
 */
export interface ConnectionMessage extends BaseMessage {
  type: 'connection';
  message: string;
}

/**
 * Registration confirmation message
 */
export interface RegisteredMessage extends BaseMessage {
  type: 'registered';
  clientType: 'client' | 'agent';
  message: string;
}

/**
 * Custom operation message
 */
export interface CustomOperationMessage extends BaseMessage {
  type: 'custom-operation';
  operation: string;
  data?: unknown;
}

/**
 * Union type of all possible messages
 */
export type Message = 
  | RegisterMessage
  | ReadFileMessage 
  | WriteFileMessage
  | AskAIMessage
  | ResponseMessage
  | ConnectionMessage
  | RegisteredMessage
  | CustomOperationMessage;

/**
 * Union type of messages that can be sent by clients
 */
export type ClientMessage = 
  | RegisterMessage
  | ReadFileMessage
  | WriteFileMessage
  | AskAIMessage
  | CustomOperationMessage;

/**
 * Union type of messages that can be sent by agents
 */
export type AgentMessage = 
  | RegisterMessage
  | ResponseMessage
  | CustomOperationMessage;

/**
 * Union type of messages that can be sent by the server
 */
export type ServerMessage = 
  | ResponseMessage
  | ConnectionMessage
  | RegisteredMessage;