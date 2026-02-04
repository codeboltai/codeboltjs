import { ProcessedMessage } from "@codebolt/types/agent";
import { BaseMessageModifier } from "../base";
import { FlatUserMessage, MessageObject, Tool } from "@codebolt/types/sdk";
import codebolt from "@codebolt/codeboltjs";

export interface ToolInjectionOptions {
    toolsLocation?: 'Tool' | 'SystemMessage' | 'InsidePrompt';
    includeToolDescriptions?: boolean;
    maxToolsInMessage?: number;
    giveToolExamples?: boolean;
    maxToolExamples?: number;
    /**
     * List of allowed tool names. If provided, only these tools will be available.
     * If not provided, all tools will be available.
     */
    allowedTools?: string[];
}

export class ToolInjectionModifier extends BaseMessageModifier {
    private readonly options: ToolInjectionOptions;

    constructor(options: ToolInjectionOptions = {}) {
        super()
        this.options = {
            toolsLocation: options.toolsLocation || 'Tool',
            includeToolDescriptions: options.includeToolDescriptions !== false,
            maxToolsInMessage: options.maxToolsInMessage || 30,
            giveToolExamples: options.giveToolExamples || false,
            maxToolExamples: options.maxToolExamples || 2
        };
    }

    async modify(originalRequest: FlatUserMessage, createdMessage: ProcessedMessage): Promise<ProcessedMessage> {
        try {
            const toolsResponse:any = await codebolt.mcp.listMcpFromServers(['codebolt']);

            let tools: any = toolsResponse?.data.tools || toolsResponse?.data || [];
            let mentionedMCPs: any = originalRequest.mentionedMCPs || [];

            const { data: mentionedTools } = await codebolt.mcp.getTools(mentionedMCPs)
            tools = [...tools, ...(mentionedTools || [])]

            // Filter tools if allowedTools is specified
            if (this.options.allowedTools && this.options.allowedTools.length > 0) {
                tools = tools.filter((tool: Tool) =>
                    this.options.allowedTools!.includes(tool.function.name)
                );
            }

            if (tools.length === 0) {
                return createdMessage;
            }

            switch (this.options.toolsLocation) {
                case 'InsidePrompt':
                    //@ts-ignore
                    return this.addToolsInsidePrompt(createdMessage, tools);
                //@ts-ignore
                case 'SystemMessage':
                    //@ts-ignore
                    return this.addToolsAsSystemMessage(createdMessage, tools);
                case 'Tool':
                    //@ts-ignore
                    return this.addToolsAsToolCalls(createdMessage, tools);
                default:
                    //@ts-ignore
                    return this.addToolsAsToolCalls(createdMessage, tools);
            }
        } catch (error) {
            console.error('Error in ToolInjectionModifier:', error);
            return createdMessage;
        }
    }

    private addToolsInsidePrompt(createdMessage: ProcessedMessage, tools: Tool[]): ProcessedMessage {
        const toolsInfo = this.generateToolsInfo(tools);

        // Modify the last user message to include tools information
        const modifiedMessages = createdMessage.message.messages.map((message, index) => {
            if (message.role === 'user' && index === createdMessage.message.messages.length - 1) {
                return {
                    ...message,
                    content: `${message.content}\n\n--- Available Tools ---\n${toolsInfo}`
                };
            }
            return message;
        });

        return {
            message: {
                ...createdMessage.message,
                messages: modifiedMessages
            },
            metadata: {
                ...createdMessage.metadata,
                toolsInjected: true,
                toolsLocation: 'InsidePrompt',
                toolsCount: tools.length
            }
        };
    }

    private addToolsAsSystemMessage(createdMessage: ProcessedMessage, tools: Tool[]): ProcessedMessage {
        const toolsInfo = this.generateToolsInfo(tools);

        const toolsMessage: MessageObject = {
            role: 'system',
            content: `Available Tools:\n${toolsInfo}`
        };

        return {
            message: {
                ...createdMessage.message,
                messages: [toolsMessage, ...createdMessage.message.messages]
            },
            metadata: {
                ...createdMessage.metadata,
                toolsInjected: true,
                toolsLocation: 'SystemMessage',
                toolsCount: tools.length
            }
        };
    }

    private addToolsAsToolCalls(createdMessage: ProcessedMessage, tools: Tool[]): ProcessedMessage {
        return {
            message: {
                ...createdMessage.message,
                tools,
                tool_choice: 'auto'
            },
            metadata: {
                ...createdMessage.metadata,
                toolsInjected: true,
                toolsLocation: 'Tool',
                toolsCount: tools.length
            }
        };
    }

    private generateToolsInfo(tools: Tool[]): string {
        const toolsInfo: string[] = [];

        tools.slice(0, this.options.maxToolsInMessage!).forEach((tool, index) => {
            let toolInfo = `${index + 1}. **${tool.function.name}**`;

            if (this.options.includeToolDescriptions && tool.function.description) {
                toolInfo += `\n   Description: ${tool.function.description}`;
            }

            if (tool.function.parameters) {
                const params = typeof tool.function.parameters === 'object'
                    ? Object.keys(tool.function.parameters as Record<string, unknown>).join(', ')
                    : String(tool.function.parameters);
                toolInfo += `\n   Parameters: ${params}`;
            }

            if (this.options.giveToolExamples && index < this.options.maxToolExamples!) {
                const example = this.generateToolExample(tool);
                if (example) {
                    toolInfo += `\n   Example: ${example}`;
                }
            }

            toolsInfo.push(toolInfo);
        });

        return toolsInfo.join('\n\n');
    }

    private generateToolExample(tool: Tool): string | null {
        // Generate simple examples based on tool name
        const toolName = tool.function.name.toLowerCase();

        if (toolName.includes('read') && toolName.includes('file')) {
            return `${tool.function.name}({ filePath: "example.txt" })`;
        }

        if (toolName.includes('write') && toolName.includes('file')) {
            return `${tool.function.name}({ filePath: "output.txt", content: "Hello World" })`;
        }

        if (toolName.includes('delete') && toolName.includes('file')) {
            return `${tool.function.name}({ filePath: "temp.txt" })`;
        }

        if (toolName.includes('move') && toolName.includes('file')) {
            return `${tool.function.name}({ sourcePath: "old.txt", destinationPath: "new.txt" })`;
        }

        if (toolName.includes('copy') && toolName.includes('file')) {
            return `${tool.function.name}({ sourcePath: "source.txt", destinationPath: "copy.txt" })`;
        }

        // Generic example
        return `${tool.function.name}({ /* parameters */ })`;
    }
}
