import { ProcessedMessage } from "@codebolt/types/agent";
import { BaseMessageModifier } from "../base";
import { FlatUserMessage, MessageObject } from "@codebolt/types/sdk";

export class SimpleMessageModifier extends BaseMessageModifier {
    constructor(){
        super()
    }

    modify(originalRequest: FlatUserMessage,createdMessage: ProcessedMessage, context?: Record<string, unknown>): Promise<ProcessedMessage> {
        
        const contextMessage: MessageObject = {
            role: 'user',
            content:"hi"
        };
        return Promise.resolve({
            message: {
                ...createdMessage.message,
                messages: [...createdMessage.message.messages, contextMessage]
            },
            metadata: {
                ...createdMessage.metadata,
                userMessageAdded: true
            }
        });
    }
  

}