import { BaseMessageModifier, MessageModifierInput, ProcessedMessage, Message, ToolList, Tool } from '@codebolt/agentprocessorframework';

export interface AddToolsListMessageModifierOptions {
    toolsList: ToolList;
    addToolsLocation?: 'InsidePrompt' | 'Tool' | 'SystemMessage';
    giveToolExamples?: boolean;
    maxToolExamples?: number;
    includeToolDescriptions?: boolean;
}

export class AddToolsListMessageModifier extends BaseMessageModifier {
    private readonly toolsList: ToolList;
    private readonly addToolsLocation: 'InsidePrompt' | 'Tool' | 'SystemMessage';
    private readonly giveToolExamples: boolean;
    private readonly maxToolExamples: number;
    private readonly includeToolDescriptions: boolean;

    constructor(options: AddToolsListMessageModifierOptions) {
        super({ context: options });
        this.toolsList = options.toolsList;
        this.addToolsLocation = options.addToolsLocation || 'SystemMessage';
        this.giveToolExamples = options.giveToolExamples || false;
        this.maxToolExamples = options.maxToolExamples || 2;
        this.includeToolDescriptions = options.includeToolDescriptions !== false; // default true
    }

    async modify(input: MessageModifierInput): Promise<ProcessedMessage> {
        try {
            const { originalRequest, createdMessage, context } = input;
            
            const tools = this.toolsList.getAllTools();
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
                    return createdMessage;
            }
        } catch (error) {
            console.error('Error in AddToolsListMessageModifier:', error);
            throw error;
        }
    }

    private addToolsInsidePrompt(createdMessage: ProcessedMessage, tools: Tool[]): ProcessedMessage {
        const toolsInfo = this.generateToolsInfo(tools);
        
        // Modify the last user message to include tools information
        const modifiedMessages = createdMessage.messages.map((message, index) => {
            if (message.role === 'user' && index === createdMessage.messages.length - 1) {
                return {
                    ...message,
                    content: `${message.content}\n\n--- Available Tools ---\n${toolsInfo}`
                };
            }
            return message;
        });

        return {
            messages: modifiedMessages,
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
        
        const toolsMessage: Message = {
            role: 'system',
            content: `Available Tools:\n${toolsInfo}`,
            name: 'tools-list'
        };

        return {
            messages: [toolsMessage, ...createdMessage.messages],
            metadata: {
                ...createdMessage.metadata,
                toolsListAdded: true,
                toolsLocation: 'SystemMessage',
                toolsCount: tools.length
            }
        };
    }

    private addToolsAsToolCalls(createdMessage: ProcessedMessage, tools: Tool[]): ProcessedMessage {
        // This would create a message that lists tools as available tool calls
        const toolsMessage: Message = {
            role: 'assistant',
            content: 'I have access to the following tools:',
            tool_calls: tools.map((tool, index) => ({
                id: `tool-info-${index}`,
                function: {
                    name: tool.name,
                    arguments: tool.parameters || {}
                }
            }))
        };

        return {
            messages: [...createdMessage.messages, toolsMessage],
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
            let toolInfo = `${index + 1}. **${tool.name}**`;
            
            if (this.includeToolDescriptions && tool.description) {
                toolInfo += `\n   Description: ${tool.description}`;
            }
            
            if (tool.parameters) {
                const params = typeof tool.parameters === 'object' 
                    ? Object.keys(tool.parameters).join(', ')
                    : String(tool.parameters);
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
        const toolName = tool.name.toLowerCase();
        
        if (toolName.includes('read') && toolName.includes('file')) {
            return `${tool.name}({ filePath: "example.txt" })`;
        }
        
        if (toolName.includes('write') && toolName.includes('file')) {
            return `${tool.name}({ filePath: "output.txt", content: "Hello World" })`;
        }
        
        if (toolName.includes('delete') && toolName.includes('file')) {
            return `${tool.name}({ filePath: "temp.txt" })`;
        }
        
        if (toolName.includes('move') && toolName.includes('file')) {
            return `${tool.name}({ sourcePath: "old.txt", destinationPath: "new.txt" })`;
        }
        
        if (toolName.includes('copy') && toolName.includes('file')) {
            return `${tool.name}({ sourcePath: "source.txt", destinationPath: "copy.txt" })`;
        }
        
        // Generic example
        return `${tool.name}({ /* parameters */ })`;
    }
}
