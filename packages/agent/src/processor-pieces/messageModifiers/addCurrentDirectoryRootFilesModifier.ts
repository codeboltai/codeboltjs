import { ProcessedMessage } from "@codebolt/types/agent";
import { BaseMessageModifier } from "../base";
import { FlatUserMessage, MessageObject } from "@codebolt/types/sdk";
import * as fs from 'fs';
import * as path from 'path';

export class AddCurrentDirectoryRootFilesModifier extends BaseMessageModifier {
    constructor(){
        super()
    }

    async modify(originalRequest: FlatUserMessage, createdMessage: ProcessedMessage, context?: Record<string, unknown>): Promise<ProcessedMessage> {
        try {
            // Use current working directory
            const currentPath = process.cwd();
            
            // Read directory contents
            const files = await fs.promises.readdir(currentPath, { withFileTypes: true });
            
            // Format files list with type indicators
            const filesList = files
                .map(file => {
                  
                    return ` ${file.name}`;
                })
                .join('\n');
            
            const filesContent = filesList || 'No files found';
            
            // Find system message and append files list to it
            const messages = [...createdMessage.message.messages];
            const systemMessageIndex = messages.findIndex(message => message.role === 'system');
            
            if (systemMessageIndex !== -1) {
                // Update existing system message
                messages[systemMessageIndex] = {
                    ...messages[systemMessageIndex],
                    content: `${messages[systemMessageIndex].content}\n\nCurrent directory root files:\n\n${filesContent}`
                };
            } else {
                // Add new system message if none exists
                messages.unshift({
                    role: 'system',
                    content: `Current directory root files:\n\n${filesContent}`
                });
            }

            // Return updated message
            return {
                message: {
                    ...createdMessage.message,
                    messages
                },
                metadata: {
                    ...createdMessage.metadata,
                    currentDirectoryFilesAdded: true,
                    currentDirectoryPath: currentPath
                }
            };
        } catch (error) {
            console.error('Error in AddCurrentDirectoryRootFilesModifier:', error);
            // Return original message if there's an error
            return createdMessage;
        }
    }
}