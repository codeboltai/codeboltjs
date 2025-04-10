interface agent {
    description: string;
    title: string;
    id: number;
    agent_id: string;
    unique_id: string;
    longDescription: string;
}
interface Message {
    userMessage: string;
    mentionedFiles?: string[];
    mentionedMCPs: string[];
    mentionedAgents: agent[];
}
export interface UserMessageContent {
    type: string;
    text: string;
}
declare class UserMessage {
    message: Message;
    promptOverride: boolean;
    userMessages: UserMessageContent[];
    mentionedMCPs: string[];
    constructor(message: Message, promptOverride?: boolean);
    getFiles(): void;
    toPrompt(bAttachFiles?: boolean, bAttachImages?: boolean, bAttachEnvironment?: boolean): Promise<UserMessageContent[]>;
    getMentionedAgents(): agent[];
    getMentionedMcps(): string[];
    getMentionedMcpsTools(): Promise<any>;
    private getEnvironmentDetail;
}
export { UserMessage };
