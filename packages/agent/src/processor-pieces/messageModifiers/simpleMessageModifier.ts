import { ProcessedMessage } from "@codebolt/types/agent";
import { BaseMessageModifier } from "../base";
import { FlatUserMessage, Message } from "@codebolt/types/sdk";

export class SimpleMessageModifier extends BaseMessageModifier {
    constructor(){
        super()
    }

    modify(originalRequest: FlatUserMessage,createdMessage: ProcessedMessage, context?: Record<string, unknown>): Promise<ProcessedMessage> {
        
        const contextMessage: Message = {
            role: 'user',
            content:"hi",
            name: 'user-message-added'
        };
        return Promise.resolve({
            messages: [contextMessage, ...createdMessage.messages],
            metadata: {
                ...createdMessage.metadata,
                userMessageAdded: true
            }
        });
    }
  

}