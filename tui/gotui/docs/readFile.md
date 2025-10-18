

interface FileReadConfirmation {
  // Base message properties
  type: 'message';
  actionType: 'READFILE';
  sender: 'agent';
  messageId: string;
  threadId: string;
  templateType: 'READFILE';
  timestamp: string | number;
  agentInstanceId?: string;
  agentId?: string;
  parentAgentInstanceId?: string;
  parentId?: string;
  parentAgentId?: string;
  
  // Payload properties
  payload: {
    type: 'file';
    path: string;
    content: string;
    originalContent?: string;
    stateEvent: 'ASK_FOR_CONFIRMATION';
    diff?: string;
    language?: string;
    size?: number;
    encoding?: string;
  };
}




interface FileReadSuccess {
  // Base message properties
  type: 'message';
  actionType: 'READFILE';
  sender: 'agent';
  messageId: string;
  threadId: string;
  templateType: 'READFILE';
  timestamp: string | number;
  agentInstanceId?: string;
  agentId?: string;
  parentAgentInstanceId?: string;
  parentId?: string;
  parentAgentId?: string;
  
  // Payload properties
  payloadType?: string;
  payloadPath?: string;
  payloadContent?: string;
  payloadCommand?: string;
  payloadActionType?: string;
  payloadProcessId?: number;
  stateEvent: 'FILE_READ';
  payloadToolName?: string;
  payloadServerName?: string;
  payloadParams?: Record<string, any>;
  
  // File-specific payload properties
  path: string;
  content: string;
  originalContent?: string;
  diff?: string;
  language?: string;
  size?: number;
  encoding?: string;
}