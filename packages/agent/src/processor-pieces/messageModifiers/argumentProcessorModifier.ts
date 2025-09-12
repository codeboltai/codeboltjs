import { ProcessedMessage } from "@codebolt/types/agent";
import { BaseMessageModifier } from "../base";
import { FlatUserMessage, MessageObject } from "@codebolt/types/sdk";

export interface ArgumentProcessorOptions {
    appendRawInvocation?: boolean;
    argumentSeparator?: string;
    includeCommandName?: boolean;
}

export class ArgumentProcessorModifier extends BaseMessageModifier {
    private readonly options: ArgumentProcessorOptions;

    constructor(options: ArgumentProcessorOptions = {}){
        super()
        this.options = {
            appendRawInvocation: options.appendRawInvocation !== false,
            argumentSeparator: options.argumentSeparator || ' ',
            includeCommandName: options.includeCommandName || false
        };
    }

    modify(originalRequest: FlatUserMessage, createdMessage: ProcessedMessage): Promise<ProcessedMessage> {
        try {
            // Get arguments from metadata
            const invocation = createdMessage.metadata?.invocation as { raw?: string; name?: string; args?: string } | undefined;
            
            if (!invocation?.args) {
                return Promise.resolve(createdMessage);
            }

            // Find the user message to append arguments to
            const userMessage = createdMessage.message.messages.find(msg => msg.role === 'user');
            if (!userMessage || typeof userMessage.content !== 'string') {
                return Promise.resolve(createdMessage);
            }

            let appendContent = '';
            
            if (this.options.appendRawInvocation && invocation.raw) {
                // Append the full raw command invocation
                appendContent = `\n\nFull command: ${invocation.raw}`;
            } else {
                // Append just the arguments
                let argsToAppend = invocation.args;
                
                if (this.options.includeCommandName && invocation.name) {
                    argsToAppend = `${invocation.name}${this.options.argumentSeparator}${argsToAppend}`;
                }
                
                appendContent = `\n\nArguments: ${argsToAppend}`;
            }

            // Update the user message with appended arguments
            const updatedMessages = createdMessage.message.messages.map(msg => {
                if (msg.role === 'user' && typeof msg.content === 'string' && msg === userMessage) {
                    return {
                        ...msg,
                        content: msg.content + appendContent
                    };
                }
                return msg;
            });

            return Promise.resolve({
                message: {
                    ...createdMessage.message,
                    messages: updatedMessages
                },
                metadata: {
                    ...createdMessage.metadata,
                    argumentsProcessed: true,
                    argumentsAppended: appendContent.trim()
                }
            });
        } catch (error) {
            console.error('Error in ArgumentProcessorModifier:', error);
            return Promise.resolve(createdMessage);
        }
    }
}
