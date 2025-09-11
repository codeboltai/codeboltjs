import { LLMCompletion, MessageObject, Tool } from "../../sdk-types";
import { ToolResult } from "../common";


/**
 * Input for unified response execution
 */
export interface ResponseInput {
    /** LLM response to process */
    llmResponse: any;
    /** Previous conversation messages */
    conversationHistory: MessageObject[];
    /** Available tools */
    tools: Tool[];
    /** Processing context */
    metaData?: Record<string, any>;
}

/**
 * Output from unified response execution
 */
export interface ResponseOutput {
    /** Tool execution results */
    toolResults: ToolResult[];
    /** Next user message (if any) */
    nextUserMessage: MessageObject | null;
    /** Updated conversation history */
    conversationHistory: MessageObject[];
    /** Whether task is completed */
    completed: boolean;
    /** Final response message */
    finalMessage?: string;
}

export interface UnifiedResponseExecutor {
    /** Execute response processing including tool execution */
    executeResponse(input: ResponseInput): Promise<ResponseOutput>;
    /** Execute tools from LLM response */
    executeTools(llmResponse: LLMCompletion, tools: Tool[], context?: Record<string, any>): Promise<ToolResult[]>;
    /** Build follow-up conversation */
    buildFollowUpConversation(
        conversationHistory: MessageObject[], 
        toolResults: ToolResult[], 
        llmResponse: LLMCompletion
    ): Promise<MessageObject[]>;
  
 
}