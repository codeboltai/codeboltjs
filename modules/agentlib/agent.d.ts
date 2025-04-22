import { SystemPrompt } from "./systemprompt";
import { TaskInstruction } from "./taskInstruction";
/**
 * Agent class that manages conversations with LLMs and tool executions.
 * Handles the conversation flow, tool calls, and task completions.
 */
declare class Agent {
    /** Available tools for the agent to use */
    private tools;
    /** Full conversation history for API calls */
    private apiConversationHistory;
    /** Maximum number of conversation turns (0 means unlimited) */
    private maxRun;
    /** System prompt that provides instructions to the model */
    private systemPrompt;
    /** Messages from the user */
    private userMessage;
    /** The next user message to be added to the conversation */
    private nextUserMessage;
    /**
     * Creates a new Agent instance.
     *
     * @param tools - The tools available to the agent
     * @param systemPrompt - The system prompt providing instructions to the LLM
     * @param maxRun - Maximum number of conversation turns (0 means unlimited)
     */
    constructor(tools: any, systemPrompt: SystemPrompt, maxRun?: number);
    /**
     * Runs the agent on a specific task until completion or max runs reached.
     *
     * @param task - The task instruction to be executed
     * @param successCondition - Optional function to determine if the task is successful
     * @returns Promise with success status, error (if any), and the last assistant message
     */
    run(task: TaskInstruction, successCondition?: () => boolean): Promise<{
        success: boolean;
        error: string | null;
        message: string | null;
    }>;
    /**
     * Attempts to make a request to the LLM with conversation history and tools.
     *
     * @param apiConversationHistory - The current conversation history
     * @param tools - The tools available to the LLM
     * @returns Promise with the LLM response
     */
    private attemptLlmRequest;
    /**
     * Executes a tool with given name and input.
     *
     * @param toolName - The name of the tool to execute
     * @param toolInput - The input parameters for the tool
     * @returns Promise with tuple [userRejected, result]
     */
    private executeTool;
    /**
     * Starts a sub-agent to handle a specific task.
     *
     * @param agentName - The name of the sub-agent to start
     * @param params - Parameters for the sub-agent
     * @returns Promise with tuple [userRejected, result]
     */
    private startSubAgent;
    /**
     * Extracts tool details from a tool call object.
     *
     * @param tool - The tool call object from the LLM response
     * @returns ToolDetails object with name, input, and ID
     */
    private getToolDetail;
    /**
     * Creates a tool result object from the tool execution response.
     *
     * @param tool_call_id - The ID of the tool call
     * @param content - The content returned by the tool
     * @returns ToolResult object
     */
    private getToolResult;
    /**
     * Fallback method for API requests in case of failures.
     *
     * @throws Error API request fallback not implemented
     */
    private attemptApiRequest;
}
export { Agent };
