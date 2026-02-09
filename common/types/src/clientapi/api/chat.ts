// --- Enums and Constants ---

/** Chat template types */
export type TemplateType =
  | 'userChat'
  | 'agentChat'
  | 'informationWithUILink'
  | 'aiRequest'
  | 'agentChatWithButton'
  | 'confirmationChat'
  | 'centerInfo'
  | 'multibuttonselect'
  | 'agentinfocard'
  | 'agentsinfolistcard'
  | 'codeconfirmation'
  | 'codeviewineditor'
  | 'confirmationwithfeedback'
  | 'manualstoptemplate'
  | 'portcheckandchange'
  | 'commandconfirmation'
  | 'confirmationRequest'
  | 'FILEREAD'
  | 'READFILE'
  | 'WRITEFILE'
  | 'FILEWRITE'
  | 'shadowgit'
  | 'FOLDERREAD'
  | 'FILESEARCH'
  | 'CODEDEFINITIONS'
  | 'MCP_TOOL'
  | 'READMANYFILES'
  | 'LISTDIRECTORY'
  | 'CODEBASESEARCH'
  | 'REVIEWMODE'
  | 'CREATE_FOLDER'
  | 'GREP'
  | 'GLOB'
  | 'AGENT_TASK'
  | 'WRITE_TODOS'
  | 'processStarted'
  | 'actionPlanTemplate'
  | 'threadObservability'
  | 'requirementPlanReview';

/** Message sender type */
export type SenderType = 'user' | 'system' | 'agent';

/** Thread status for chat operations */
export type ChatThreadStatus = 'active' | 'archived' | 'closed' | 'hidden';

// --- Core Entities ---

/** Sender typing info */
export interface SenderTyping {
  senderType: SenderType;
  senderInfo: Record<string, unknown>;
}

/** Chat message structure */
export interface ChatMessage {
  messageId?: string;
  threadId?: string;
  timestamp?: number;
  isNewMessage?: boolean;
  templateType: TemplateType;
  sender: SenderTyping;
  data: unknown;
}

/** Thread info summary */
export interface ChatThreadInfo {
  id: string;
  title?: string;
  type?: string;
  status?: ChatThreadStatus;
  createdAt?: string;
  updatedAt?: string;
  messageCount?: number;
  lastMessagePreview?: string;
  metadata?: Record<string, unknown>;
}

/** Chat thread step */
export interface ChatThreadStep {
  id?: string;
  threadId: string;
  content?: string;
  status?: string;
  result?: unknown;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}

/** Steering step */
export interface SteeringStep {
  id?: string;
  threadId: string;
  content: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}

// --- Request Types ---

/** Initiate new thread request */
export interface InitiateNewThreadRequest {
  threadId?: string;
  projectPath?: string;
}

/** Set active thread request */
export interface SetActiveThreadRequest {
  threadId: string;
}

/** Thread ID request (used by hide, remove, delete, switch) */
export interface ThreadIdRequest {
  threadId: string;
}

/** Update thread status request */
export interface UpdateChatThreadStatusRequest {
  threadId: string;
  status: string;
}

/** Update thread type request */
export interface UpdateThreadTypeRequest {
  threadId: string;
  type: string;
}

/** Update thread location request */
export interface UpdateThreadLocationRequest {
  threadId: string;
  location: string;
}

/** Update thread name request */
export interface UpdateThreadNameRequest {
  threadId: string;
  name: string;
}

/** Auto update thread name request */
export interface AutoUpdateThreadNameRequest {
  threadId: string;
  message?: string;
}

/** Create thread request */
export interface CreateChatThreadRequest {
  title?: string;
  type?: string;
}

/** Store message request */
export interface StoreMessageRequest {
  threadId: string;
  message: Record<string, unknown>;
}

/** Create remote task request */
export interface CreateRemoteTaskRequest {
  messagePayload: Record<string, unknown>;
}

/** Create scheduled task request */
export interface CreateScheduledTaskRequest {
  messagePayload: Record<string, unknown>;
}

/** Add step request */
export interface AddStepRequest {
  threadId: string;
  stepContent: string;
  stepData?: Record<string, unknown>;
}

/** Update task request */
export interface UpdateChatTaskRequest {
  taskId?: string;
  taskData?: Record<string, unknown>;
  messagePayload?: Record<string, unknown>;
}

/** Add steering step request */
export interface AddSteeringStepRequest {
  threadId: string;
  steeringContent: string;
  steeringData?: Record<string, unknown>;
}

/** Update thread step data */
export interface UpdateThreadStepData {
  status?: string;
  userMessage?: string;
  condition?: string;
  agentId?: string;
}

/** Update steering step data */
export interface UpdateSteeringStepData {
  status?: string;
  content?: string;
}

/** Complete step data */
export interface CompleteStepData {
  result?: unknown;
}
