interface FileWriteConfirmation {
  // Base message properties
  type: 'message';
  actionType: 'WRITEFILE';
  sender: 'agent';
  messageId: string;
  threadId: string;
  templateType: 'WRITEFILE';
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
    originalContent: string;
    stateEvent: 'askForConfirmation';
    diff?: string;
    language?: string;
    size?: number;
    encoding?: string;
  };
}

interface FileWriteSuccess {
  // Base message properties
  type: 'message';
  actionType: 'WRITEFILE';
  sender: 'agent';
  messageId: string;
  threadId: string;
  templateType: 'WRITEFILE';
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
    stateEvent: 'fileWrite';
    diff?: string;
    language?: string;
    size?: number;
    encoding?: string;
  };
}