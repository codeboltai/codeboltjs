import { ProcessedMessage } from "@codebolt/types/agent";
import { BaseMessageModifier } from "../base";
import { FlatUserMessage, MessageObject } from "@codebolt/types/sdk";
import codebolt from '@codebolt/codeboltjs';
import os from 'os';
export class BaseContextMessageModifier extends BaseMessageModifier {
    constructor() {
        super()
    }

    async modify(originalRequest: FlatUserMessage, createdMessage: ProcessedMessage): Promise<ProcessedMessage> {

        const contextParts: string[] = [];
        const now = new Date();
        contextParts.push(`Current Date/Time: ${now.toISOString()}`);
        const osInfo = {
            platform: os.platform(),
            arch: os.arch(),
            version: os.version(),
            hostname: os.hostname()
        };
        contextParts.push(`Operating System: ${JSON.stringify(osInfo, null, 2)}`);
        try {
            const {projectPath} = await codebolt.project.getProjectPath();
            contextParts.push(`Working Directory: ${projectPath}`);
        } catch (error) {
            contextParts.push(`Working Directory: ${process.cwd()}`);
        }
        if (contextParts.length > 0) {
            const contextMessage: MessageObject = {
                role: 'system',
                content: contextParts.join('\n\n'),
            };

            // Create a copy of messages array
            const messages = [...createdMessage.message.messages];

            // Check if system message already exists in the messages array
            const existingSystemMessageIndex = messages.findIndex(
                msg => msg.role == 'system'
            );
            
            if (existingSystemMessageIndex !== -1) {
                // Append context to existing system message content
                const existingContent = messages[existingSystemMessageIndex].content || '';
                messages[existingSystemMessageIndex] = {
                    ...messages[existingSystemMessageIndex],
                    content: existingContent + '\n\n' + contextMessage.content
                };
            } else {
                // Add system message to the top of the array
                messages.unshift(contextMessage);
            }

            // Return new ProcessedMessage object
            return {
                message: {
                    ...createdMessage.message,
                    messages
                },
                metadata: {
                    ...createdMessage.metadata
                }
            };
        }

        return createdMessage;
    }


}