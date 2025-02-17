import { UserMessage, UserMessageContent } from "./usermessage";
interface Tools {
    [key: string]: {
        description: string;
        usage: string;
        example?: string;
    };
}
interface UserMessages {
    type: string;
    text: string;
}
declare class TaskInstruction {
    tools: Tools;
    userMessages: UserMessageContent[];
    userMessage: UserMessage;
    filepath: string;
    refsection: string;
    constructor(tools: Tools | undefined, userMessage: UserMessage, filepath?: string, refsection?: string);
    toPrompt(): Promise<UserMessages[]>;
}
export { TaskInstruction };
