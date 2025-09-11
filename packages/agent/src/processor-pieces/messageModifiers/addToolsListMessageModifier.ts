import { ProcessedMessage } from "@codebolt/types/agent";
import { BaseMessageModifier } from "../base";
import { FlatUserMessage, MessageObject, Tool } from "@codebolt/types/sdk";
import codebolt from "@codebolt/codeboltjs";



// Define ToolList interface based on the patterns found
export interface ToolList {
    getAllTools(): Tool[];
    addTool?(tool: Tool): void;
    removeTool?(toolName: string): void;
    getTool?(toolName: string): Tool | undefined;
    getToolNames?(): string[];
}

export interface AddToolsListMessageModifierOptions {
    toolsList?: ToolList;
    addToolsLocation?: 'InsidePrompt' | 'Tool' | 'SystemMessage';
    giveToolExamples?: boolean;
    maxToolExamples?: number;
    includeToolDescriptions?: boolean;
}

export class AddToolsListMessageModifier extends BaseMessageModifier {
    private readonly toolsList?: ToolList;
    private readonly addToolsLocation: 'InsidePrompt' | 'Tool' | 'SystemMessage';
    private readonly giveToolExamples: boolean;
    private readonly maxToolExamples: number;
    private readonly includeToolDescriptions: boolean;

    constructor(options: AddToolsListMessageModifierOptions = {}) {
        super({ context: options as unknown as Record<string, unknown> });
        this.toolsList = options.toolsList;
        this.addToolsLocation = options.addToolsLocation || 'SystemMessage';
        this.giveToolExamples = options.giveToolExamples || false;
        this.maxToolExamples = options.maxToolExamples || 2;
        this.includeToolDescriptions = options.includeToolDescriptions !== false; // default true
    }

    async modify(originalRequest: FlatUserMessage, createdMessage: ProcessedMessage): Promise<ProcessedMessage> {
        try {
            const toolsResponse = await codebolt.mcp.listMcpFromServers(['codebolt']);
            const tools:any = toolsResponse?.data ||[];
            if (tools.length === 0) {
                return createdMessage;
            }
            
            switch (this.addToolsLocation) {
                case 'InsidePrompt':
                    return this.addToolsInsidePrompt(createdMessage, tools);
                case 'SystemMessage':
                    return this.addToolsAsSystemMessage(createdMessage, tools);
                case 'Tool':
                    return this.addToolsAsToolCalls(createdMessage, tools);
                default:
                    return this.addToolsAsToolCalls(createdMessage, tools);

            }
        } catch (error) {
            console.error('Error in AddToolsListMessageModifier:', error);
            throw error;
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
                toolsListAdded: true,
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
                toolsListAdded: true,
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
                tool_choice:'auto'
            },
            metadata: {
                ...createdMessage.metadata,
                toolsListAdded: true,
                toolsLocation: 'Tool',
                toolsCount: tools.length
            }
        };
    }

    private generateToolsInfo(tools: Tool[]): string {
        const toolsInfo: string[] = [];
        
        tools.forEach((tool, index) => {
            let toolInfo = `${index + 1}. **${tool.function.name}**`;
            
            if (this.includeToolDescriptions && tool.function.description) {
                toolInfo += `\n   Description: ${tool.function.description}`;
            }
            
            if (tool.function.parameters) {
                const params = typeof tool.function.parameters === 'object' 
                    ? Object.keys(tool.function.parameters as Record<string, unknown>).join(', ')
                    : String(tool.function.parameters);
                toolInfo += `\n   Parameters: ${params}`;
            }
            
            if (this.giveToolExamples && index < this.maxToolExamples) {
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
