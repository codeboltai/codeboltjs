
```
declare enum AgentTypeEnum {
    marketplace = "marketplace",
    localZip = "local-zip",
    localPath = "local-path",
    serverZip = "server-zip"
}

export interface UserMessage {
    type: string;
    message: FlatUserMessage;
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
export interface FlatUserMessage {
    userMessage: string;
    currentFile?: string;
    selectedAgent: {
        id: string;
        name: string;
        lastMessage?: Record<string, any>;
        agentType?: AgentTypeEnum;
        agentDetails?: string;
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
    selection?: any | null;
    controlFiles?: any[];
    feedbackMessage?: string;
    terminalMessage?: string;
    messageId: string;
    threadId: string;
    templateType?: string;
    processId?: string;
    shadowGitHash?: string;
    remixPrompt?: any;
    activeFile?: string;
    openedFiles?: string[];
}
```