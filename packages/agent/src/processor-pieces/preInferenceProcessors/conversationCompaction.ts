import { ProcessedMessage } from "@codebolt/types/agent";
import { BaseMessageModifier, BasePreInferenceProcessor } from "../base";
import { FlatUserMessage, MessageObject } from "@codebolt/types/sdk";
import { resolve } from "path";



export class ConversationCompection extends BasePreInferenceProcessor {

    constructor(){
        super()
    }
    modify(originalRequest: FlatUserMessage,createdMessage: ProcessedMessage, context?: Record<string, unknown>): Promise<ProcessedMessage> {
        
        const updatedMessages = createdMessage.message.messages.map(message => {
            if (message.role === 'user') {
                return {
                    ...message,
                    content: `${message.content} user message compected`
                };
            }
            return message;
        });
        return Promise.resolve({
            message: {
                ...createdMessage.message,
                messages: updatedMessages
            },
            metadata: {
                ...createdMessage.metadata,
                chatsummerized: true
            }
        })

    }

}