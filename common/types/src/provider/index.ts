import { FlatUserMessage } from "../sdk-types";

export enum AgentType {
    Marketplace = 'marketplace',
    Zip_Path = 'zippath',
    Folder_Path='folderpath',
    URL = 'url'
  }
  
  export interface AgentStartMessage extends FlatUserMessage {
    task?: string;
    context?: unknown;
    timestamp?: number;
    agentId: string;
    agentType:AgentType,
    path?:string
    [key: string]: unknown;
  
  }
  
  export interface RawMessageForAgent {
    type: string;
    requestId: string;
    action?: string;
    data?: unknown;
    timestamp?: number;
    [key: string]: unknown;
  }