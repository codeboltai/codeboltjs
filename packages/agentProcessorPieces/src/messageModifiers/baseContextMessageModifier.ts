import { BaseMessageModifier, MessageModifierInput, ProcessedMessage, Message } from '@codebolt/agentprocessorframework';
import codebolt from '@codebolt/codeboltjs';
import os from 'os';

export interface BaseContextMessageModifierOptions {
    prependmessage?: string;
    datetime?: boolean;
    osInfo?: boolean;
    workingdir?: boolean;
}

export class BaseContextMessageModifier extends BaseMessageModifier {
    private readonly prependMessage: string;
    private readonly includeDateTime: boolean;
    private readonly includeOsInfo: boolean;
    private readonly includeWorkingDir: boolean;

    constructor(options: BaseContextMessageModifierOptions = {}) {
        super({ context: options });
        this.prependMessage = options.prependmessage || '';
        this.includeDateTime = options.datetime || false;
        this.includeOsInfo = options.osInfo || false;
        this.includeWorkingDir = options.workingdir || false;
    }

    async modify(input: MessageModifierInput): Promise<ProcessedMessage> {
        try {
            const { originalRequest, createdMessage, context } = input;
            
            const contextParts: string[] = [];
            
            // Add prepend message if provided
            if (this.prependMessage) {
                contextParts.push(this.prependMessage);
            }
            
            // Add date/time if requested
            if (this.includeDateTime) {
                const now = new Date();
                contextParts.push(`Current Date/Time: ${now.toISOString()}`);
            }
            
            // Add OS info if requested
            if (this.includeOsInfo) {
                const osInfo = {
                    platform: os.platform(),
                    arch: os.arch(),
                    version: os.version(),
                    hostname: os.hostname()
                };
                contextParts.push(`Operating System: ${JSON.stringify(osInfo, null, 2)}`);
            }
            
            // Add working directory if requested
            if (this.includeWorkingDir) {
                try {
                    const projectPath = await codebolt.project.getProjectPath();
                    contextParts.push(`Working Directory: ${projectPath}`);
                } catch (error) {
                    contextParts.push(`Working Directory: ${process.cwd()}`);
                }
            }
            
            // Create context message if we have any context parts
            if (contextParts.length > 0) {
                const contextMessage: Message = {
                    role: 'system',
                    content: contextParts.join('\n\n'),
                    name: 'base-context'
                };

                return {
                    messages: [contextMessage, ...createdMessage.messages],
                    metadata: {
                        ...createdMessage.metadata,
                        baseContextAdded: true,
                        contextParts: contextParts.length
                    }
                };
            }

            return createdMessage;
        } catch (error) {
            console.error('Error in BaseContextMessageModifier:', error);
            throw error;
        }
    }
}
