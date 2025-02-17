interface Message {
    userMessage: string;
    mentionedFiles?: string[];
    mentionedMCPs: string[];
}
export interface UserMessageContent {
    type: string;
    text: string;
}
declare class UserMessage {
    message: Message;
    promptOverride: boolean;
    userMessages: UserMessageContent[];
    mentaionedMCPS: string[];
    constructor(message: Message, promptOverride?: boolean);
    getFiles(): void;
    toPrompt(bAttachFiles?: boolean, bAttachImages?: boolean, bAttachEnvironment?: boolean): Promise<UserMessageContent[]>;
    getMentionedMcps(): string[];
    getMentionedMcpsTools(): Promise<any>;
    private getEnvironmentDetail;
}
export { UserMessage };
