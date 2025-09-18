import { ProcessedMessage } from "@codebolt/types/agent";
import { BaseMessageModifier } from "../base";
import { FlatUserMessage, MessageObject, ChatMessage, ToolCall } from "@codebolt/types/sdk";
import codebolt from '@codebolt/codeboltjs';

export interface ChatHistoryMessageModifierOptions {
    enableChatHistory?: boolean;
    maxHistoryMessages?: number;
    includeSystemMessages?: boolean;
    [key: string]: unknown;
}

// Using MessageObject from SDK types for chat history messages

export class ChatHistoryMessageModifier extends BaseMessageModifier {
    private readonly enableChatHistory: boolean;
    private readonly maxHistoryMessages: number;
    private readonly includeSystemMessages: boolean;

    constructor(options: ChatHistoryMessageModifierOptions = {}) {
        super({ context: options as Record<string, unknown> });
        this.enableChatHistory = options.enableChatHistory !== false;
        this.maxHistoryMessages = options.maxHistoryMessages || 20;
        this.includeSystemMessages = options.includeSystemMessages !== false;
    }

    async modify(originalRequest: FlatUserMessage, createdMessage: ProcessedMessage): Promise<ProcessedMessage> {
        try {
            if (!this.enableChatHistory) {
                return createdMessage;
            }

            // Get chat history using the thread ID from the original request
            const chatHistory = await this.getChatHistory(originalRequest.threadId);
            
            if (!chatHistory || chatHistory.length === 0) {
                return createdMessage;
            }

            // Directly use the chat history messages - they're already in MessageObject format
            return {
                message: {
                    ...createdMessage.message,
                    messages: [...chatHistory, ...createdMessage.message.messages]
                },
                metadata: {
                    ...createdMessage.metadata,
                    chatHistoryAdded: true,
                    chatHistoryCount: chatHistory.length,
                    threadId: originalRequest.threadId
                }
            };

        } catch (error) {
            console.error('Error in ChatHistoryMessageModifier:', error);
            // Return original message if chat history fails to avoid breaking the flow
            return createdMessage;
        }
    }

    private async getChatHistory(threadId: string): Promise<MessageObject[]> {
        try {
            const response:any = await codebolt.chat.getChatHistory(threadId);
            
            // Check if response has messages array
            if (!response?.chats || !response?.chats?.messages || !Array.isArray(response?.chats?.messages) || response?.chats?.messages.length === 0) {
                return [];
            }

            let historyMessages = response?.chats?.messages;

            // Thread filtering is now handled by the API directly via threadId parameter

            // Filter out system messages if not included
            if (!this.includeSystemMessages) {
                historyMessages = historyMessages.filter((msg: any) => 
                    msg.role !== 'system'
                );
            }

            // Limit the number of messages
            // will do it later
            if (false) {
                historyMessages = historyMessages.slice(-this.maxHistoryMessages);
            }

            // Check if the last message is an assistant message with tool_calls
            // If so, add tool response messages for each tool_call
            const lastMessage = historyMessages[historyMessages.length - 1];
            if (lastMessage && 
                lastMessage.role === 'assistant' && 
                lastMessage.tool_calls && 
                Array.isArray(lastMessage.tool_calls) && 
                lastMessage.tool_calls.length > 0) {
                
                // Add tool response messages for each tool_call
                const toolResponseMessages: MessageObject[] = [];
                for (const toolCall of lastMessage.tool_calls) {
                    toolResponseMessages.push({
                        role: 'tool',
                        content: `Tool call "${toolCall.function.name}" was not executed. This appears to be from a previous incomplete conversation. The tool was called with arguments: ${toolCall.function.arguments}`,
                        tool_call_id: toolCall.id
                    });
                }
                
              
                
                // Return original messages + tool responses + context message
                return [...historyMessages, ...toolResponseMessages];
            }
              // Add a system message to indicate this is previous conversation
              const contextMessage: MessageObject = {
                role: 'user',
                content: '--- End of previous conversation history ---\n\nThe above messages are from a previous conversation. Any incomplete tool calls have been marked as not executed. You should now respond to the current user message.'
            };
            historyMessages=[...historyMessages,contextMessage]
            // Return messages as-is if no tool_calls in last message
            return historyMessages;

        } catch (error) {
            console.error('Error retrieving chat history:', error);
            return [];
        }
    }

    public setMaxHistoryMessages(max: number): void {
        (this as any).maxHistoryMessages = max;
    }
}
