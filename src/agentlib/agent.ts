import chatlib from "../modules/chat"
import tools from "../modules/mcp"
import llm from "../modules/llm"
import codeboltAgent from "../modules/agent"
import { SystemPrompt } from "./systemprompt";
import { TaskInstruction } from "./taskInstruction";

/**
 * Represents a message in the conversation with roles and content.
 */
interface Message {
    /** The role of the message sender: user, assistant, tool, or system */
    role: 'user' | 'assistant' | 'tool' | 'system';
    /** The content of the message, can be an array of content blocks or a string */
    content: any[] | string;
    /** Optional ID for tool calls */
    tool_call_id?: string;
    /** Additional properties that might be present */
    [key: string]: any;
}

/**
 * Represents the result from a tool execution.
 */
interface ToolResult {
    /** Always 'tool' for tool execution results */
    role: 'tool';
    /** ID that links this result to the original tool call */
    tool_call_id: string;
    /** The content returned by the tool */
    content: any;
    /** Optional user message to be added after tool execution */
    userMessage?: any;
}

/**
 * Details about a tool to be executed.
 */
interface ToolDetails {
    /** The name of the tool to execute */
    toolName: string;
    /** Input parameters for the tool */
    toolInput: any;
    /** Unique ID for this tool use instance */
    toolUseId: string;
}

/**
 * Agent class that manages conversations with LLMs and tool executions.
 * Handles the conversation flow, tool calls, and task completions.
 */
class Agent {
    /** Available tools for the agent to use */
    private tools: any[];
    /** Full conversation history for API calls */
    private apiConversationHistory: Message[];
    /** Maximum number of conversation turns (0 means unlimited) */
    private maxRun: number;
    /** System prompt that provides instructions to the model */
    private systemPrompt: SystemPrompt;
    /** Messages from the user */
    private userMessage: Message[];
    /** The next user message to be added to the conversation */
    private nextUserMessage: any;

    /**
     * Creates a new Agent instance.
     * 
     * @param tools - The tools available to the agent
     * @param systemPrompt - The system prompt providing instructions to the LLM
     * @param maxRun - Maximum number of conversation turns (0 means unlimited)
     */
    constructor(tools: any = [], systemPrompt: SystemPrompt, maxRun: number = 0) {
        this.tools = tools;
        this.userMessage = [];
        this.apiConversationHistory = [];
        this.maxRun = maxRun;
        this.systemPrompt = systemPrompt;

    }

    /**
     * Runs the agent on a specific task until completion or max runs reached.
     * 
     * @param task - The task instruction to be executed
     * @param successCondition - Optional function to determine if the task is successful
     * @returns Promise with success status, error (if any), and the last assistant message
     */
    async run(task: TaskInstruction, successCondition: () => boolean = () => true): Promise<{ success: boolean; error: string | null, message: string | null }> {


        let mentaionedMCPSTool: any[] = await task.userMessage.getMentionedMcpsTools();

        this.tools = [
            ...this.tools,
            ...mentaionedMCPSTool,

        ]
        let mentionedAgents = await task.userMessage.getMentionedAgents();

        // Transform agents into tool format
        const agentTools = mentionedAgents.map(agent => {
            return {
                type: "function",
                function: {
                    name: `subagent--${agent.unique_id}`,
                    description: agent.longDescription || agent.description,
                    parameters: {
                        type: "object",
                        properties: {
                            task: {
                                type: "string",
                                description: "The task to be executed by the tool."
                            }
                        },
                        required: ["task"]
                    }
                }
            };
        });

        this.tools = this.tools.concat(agentTools);


        let completed = false;
        let userMessages = await task.toPrompt();
        this.apiConversationHistory.push({ role: "user", content: userMessages });
        let runcomplete = 0;
        while (!completed && (runcomplete <= this.maxRun || this.maxRun === 0)) {
            try {
                runcomplete++;
                const response = await this.attemptLlmRequest(this.apiConversationHistory, this.tools);
                let isMessagePresentinReply = false;

                for (const contentBlock of response.choices) {
                    if (contentBlock.message) {
                        isMessagePresentinReply = true;
                        this.apiConversationHistory.push(contentBlock.message);

                        if (contentBlock.message.content != null) {
                            await chatlib.sendMessage(contentBlock.message.content, {});
                        }
                    }
                }

                if (!isMessagePresentinReply) {
                    this.apiConversationHistory.push({
                        role: "assistant",
                        content: [{ type: "text", text: "Failure: I did not provide a response." }],
                    });
                }

                try {
                    let toolResults: ToolResult[] = [];
                    let taskCompletedBlock: any;
                    let userRejectedToolUse = false;
                    const contentBlock = response.choices[0];

                    if (contentBlock.message?.tool_calls) {
                        for (const tool of contentBlock.message.tool_calls) {
                            try {
                                const { toolInput, toolName, toolUseId } = this.getToolDetail(tool);

                                if (!userRejectedToolUse) {
                                    if (toolName.includes("attempt_completion")) {
                                        taskCompletedBlock = tool;
                                    } else {

                                        let [serverName] = toolName.replace('--', ':').split(':');


                                        if (serverName == 'subagent') {

                                            const agentResponse = await codeboltAgent.startAgent(toolName.replace("subagent--", ''), toolInput.task);
                                            const [didUserReject, result] = [false, "tool result is successful"];
                                            let toolResult = this.getToolResult(toolUseId, result)
                                            toolResults.push({
                                                role: "tool",
                                                tool_call_id: toolResult.tool_call_id,
                                                content: toolResult.content,

                                            });
                                            if (toolResult.userMessage) {
                                                this.nextUserMessage = {
                                                    role: "user",
                                                    content: toolResult.userMessage
                                                }
                                            }
                                            if (didUserReject) {
                                                userRejectedToolUse = true;
                                            }

                                        }
                                        else {
                                            console.log("Executing tool: ", toolName, toolInput);
                                            const [didUserReject, result] = await this.executeTool(toolName, toolInput);
                                            console.log("Tool result: ", result);
                                            // toolResults.push(this.getToolResult(toolUseId, result));
                                            let toolResult = this.getToolResult(toolUseId, result)
                                         
                                            toolResults.push({
                                                role: "tool",
                                                tool_call_id: toolResult.tool_call_id,
                                                content: toolResult.content,

                                            });
                                            if (toolResult.userMessage) {
                                                this.nextUserMessage = {
                                                    role: "user",
                                                    content: toolResult.userMessage
                                                }
                                            }
                                            if (didUserReject) {
                                                userRejectedToolUse = true;
                                            }
                                        }

                                    }
                                } else {
                                    let toolResult = this.getToolResult(toolUseId, "Skipping tool execution due to previous tool user rejection.")

                                    toolResults.push({
                                        role: "tool",
                                        tool_call_id: toolResult.tool_call_id,
                                        content: toolResult.content,

                                    });
                                    if (toolResult.userMessage) {
                                        this.nextUserMessage = {
                                            role: "user",
                                            content: toolResult.userMessage
                                        }
                                    }

                                }
                            } catch (error) {
                              
                                toolResults.push({
                                    role: "tool",
                                    tool_call_id: tool.id,
                                    content: String(error),

                                });

                            }
                        }
                    }

                    if (taskCompletedBlock) {
                        let [_, result] = await this.executeTool(
                            taskCompletedBlock.function.name,
                            JSON.parse(taskCompletedBlock.function.arguments || "{}")
                        );

                        if (result === "") {
                            completed = true;
                            result = "The user is satisfied with the result.";
                        }
                        let toolResult = this.getToolResult(taskCompletedBlock.id, result)
                        toolResults.push({
                            role: "tool",
                            tool_call_id: toolResult.tool_call_id,
                            content: toolResult.content,

                        });
                        if (toolResult.userMessage) {
                            this.nextUserMessage = {
                                role: "user",
                                content: toolResult.userMessage
                            }
                        }

                    }

                    this.apiConversationHistory.push(...toolResults);
                    if (this.nextUserMessage) {
                        this.apiConversationHistory.push(this.nextUserMessage);
                    }
                    let nextUserMessage: Message[] = toolResults;

                    if (toolResults.length === 0) {
                        nextUserMessage = [{
                            role: "user",
                            content: [{
                                type: "text",
                                text: "If you have completed the user's task, use the attempt_completion tool. If you require additional information from the user, use the ask_followup_question tool. Otherwise, if you have not completed the task and do not need additional information, then proceed with the next step of the task. (This is an automated message, so do not respond to it conversationally.)"
                            }]
                        }];

                        if (nextUserMessage) {
                            this.apiConversationHistory.push(nextUserMessage[0]);
                        }
                    }
                } catch (error) {
                    console.error("Error in agent tool call:", error);
                    return { success: false, error: error instanceof Error ? error.message : String(error), message: null };
                }
            } catch (error) {
                console.error("Error in agent tool call:", error);
                return { success: false, error: error instanceof Error ? error.message : String(error), message: null };
            }
        }

        return {
            success: completed,
            error: null,
            message: this.apiConversationHistory
                .filter(msg => msg.role === 'assistant')
                .pop()?.content as string || ''
        };
    }

    /**
     * Attempts to make a request to the LLM with conversation history and tools.
     * 
     * @param apiConversationHistory - The current conversation history
     * @param tools - The tools available to the LLM
     * @returns Promise with the LLM response
     */
    private async attemptLlmRequest(apiConversationHistory: Message[], tools: Record<string, any>): Promise<any> {


        try {
            let systemPrompt = await this.systemPrompt.toPromptText();
            const aiMessages: Message[] = [
                { role: "system", content: systemPrompt },
                ...apiConversationHistory,
            ];

            const createParams = {
                full: true,
                messages: aiMessages,
                tools: tools,
                tool_choice: "auto",
            };
            //@ts-ignore
            const { completion } = await llm.inference(createParams);
            return completion;
        } catch (error) {
            return this.attemptApiRequest();
        }
    }

    /**
     * Executes a tool with given name and input.
     * 
     * @param toolName - The name of the tool to execute
     * @param toolInput - The input parameters for the tool
     * @returns Promise with tuple [userRejected, result]
     */
    private async executeTool(toolName: string, toolInput: any): Promise<[boolean, any]> {
        //codebolttools--readfile
        console.log("Executing tool: ", toolName, toolInput);
        const [toolboxName, actualToolName] = toolName.split('--');
        console.log("Toolbox name: ", toolboxName, "Actual tool name: ", actualToolName);
        const {data} = await tools.executeTool(toolboxName, actualToolName, toolInput);
        console.log("Tool result: ", data);
        return data;
    }

    /**
     * Starts a sub-agent to handle a specific task.
     * 
     * @param agentName - The name of the sub-agent to start
     * @param params - Parameters for the sub-agent
     * @returns Promise with tuple [userRejected, result]
     */
    private async startSubAgent(agentName: string, params: any): Promise<[boolean, any]> {
        return codeboltAgent.startAgent(agentName, params.task);
    }

    /**
     * Extracts tool details from a tool call object.
     * 
     * @param tool - The tool call object from the LLM response
     * @returns ToolDetails object with name, input, and ID
     */
    private getToolDetail(tool: any): ToolDetails {
        return {
            toolName: tool.function.name,
            toolInput: JSON.parse(tool.function.arguments || "{}"),
            toolUseId: tool.id
        };
    }

    /**
     * Creates a tool result object from the tool execution response.
     * 
     * @param tool_call_id - The ID of the tool call
     * @param content - The content returned by the tool
     * @returns ToolResult object
     */
    private getToolResult(tool_call_id: string, content: string): ToolResult {
        let userMessage = undefined
        try {
            let parsed = JSON.parse(content);

            console.log("Parsed Content: ", parsed);
            if (parsed.payload && parsed.payload.content) {
                content = `The browser action has been executed. The  screenshot have been captured for your analysis. The tool response is provided in the next user message`
                // this.apiConversationHistory.push()
                userMessage = parsed.payload.content
            }
        } catch (error) {

        }
        return {
            role: "tool",
            tool_call_id,
            content,
            userMessage
        };
    }

    /**
     * Fallback method for API requests in case of failures.
     * 
     * @throws Error API request fallback not implemented
     */
    private attemptApiRequest(): any {
        throw new Error("API request fallback not implemented");
    }
}

export { Agent };