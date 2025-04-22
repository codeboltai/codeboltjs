"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agent = void 0;
const chat_1 = __importDefault(require("./../chat"));
const tools_1 = __importDefault(require("./../tools"));
const llm_1 = __importDefault(require("./../llm"));
const agent_1 = __importDefault(require("./../agent"));
/**
 * Agent class that manages conversations with LLMs and tool executions.
 * Handles the conversation flow, tool calls, and task completions.
 */
class Agent {
    /**
     * Creates a new Agent instance.
     *
     * @param tools - The tools available to the agent
     * @param systemPrompt - The system prompt providing instructions to the LLM
     * @param maxRun - Maximum number of conversation turns (0 means unlimited)
     */
    constructor(tools = [], systemPrompt, maxRun = 0) {
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
    async run(task, successCondition = () => true) {
        var _a, _b;
        let mentaionedMCPSTool = await task.userMessage.getMentionedMcpsTools();
        this.tools = [
            ...this.tools,
            ...mentaionedMCPSTool,
        ];
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
                            await chat_1.default.sendMessage(contentBlock.message.content, {});
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
                    let toolResults = [];
                    let taskCompletedBlock;
                    let userRejectedToolUse = false;
                    const contentBlock = response.choices[0];
                    if ((_a = contentBlock.message) === null || _a === void 0 ? void 0 : _a.tool_calls) {
                        for (const tool of contentBlock.message.tool_calls) {
                            const { toolInput, toolName, toolUseId } = this.getToolDetail(tool);
                            if (!userRejectedToolUse) {
                                if (toolName.includes("attempt_completion")) {
                                    taskCompletedBlock = tool;
                                }
                                else {
                                    let [serverName] = toolName.replace('--', ':').split(':');
                                    if (serverName == 'subagent') {
                                        const agentResponse = await agent_1.default.startAgent(toolName.replace("subagent--", ''), toolInput.task);
                                        const [didUserReject, result] = [false, "tool result is successful"];
                                        let toolResult = this.getToolResult(toolUseId, result);
                                        toolResults.push({
                                            role: "tool",
                                            tool_call_id: toolResult.tool_call_id,
                                            content: toolResult.content,
                                        });
                                        if (toolResult.userMessage) {
                                            this.nextUserMessage = {
                                                role: "user",
                                                content: toolResult.userMessage
                                            };
                                        }
                                        if (didUserReject) {
                                            userRejectedToolUse = true;
                                        }
                                    }
                                    else {
                                        const [didUserReject, result] = await this.executeTool(toolName, toolInput);
                                        // toolResults.push(this.getToolResult(toolUseId, result));
                                        let toolResult = this.getToolResult(toolUseId, result);
                                        toolResults.push({
                                            role: "tool",
                                            tool_call_id: toolResult.tool_call_id,
                                            content: toolResult.content,
                                        });
                                        if (toolResult.userMessage) {
                                            this.nextUserMessage = {
                                                role: "user",
                                                content: toolResult.userMessage
                                            };
                                        }
                                        if (didUserReject) {
                                            userRejectedToolUse = true;
                                        }
                                    }
                                }
                            }
                            else {
                                let toolResult = this.getToolResult(toolUseId, "Skipping tool execution due to previous tool user rejection.");
                                toolResults.push({
                                    role: "tool",
                                    tool_call_id: toolResult.tool_call_id,
                                    content: toolResult.content,
                                });
                                if (toolResult.userMessage) {
                                    this.nextUserMessage = {
                                        role: "user",
                                        content: toolResult.userMessage
                                    };
                                }
                            }
                        }
                    }
                    if (taskCompletedBlock) {
                        let [_, result] = await this.executeTool(taskCompletedBlock.function.name, JSON.parse(taskCompletedBlock.function.arguments || "{}"));
                        if (result === "") {
                            completed = true;
                            result = "The user is satisfied with the result.";
                        }
                        let toolResult = this.getToolResult(taskCompletedBlock.id, result);
                        toolResults.push({
                            role: "tool",
                            tool_call_id: toolResult.tool_call_id,
                            content: toolResult.content,
                        });
                        if (toolResult.userMessage) {
                            this.nextUserMessage = {
                                role: "user",
                                content: toolResult.userMessage
                            };
                        }
                    }
                    this.apiConversationHistory.push(...toolResults);
                    if (this.nextUserMessage) {
                        this.apiConversationHistory.push(this.nextUserMessage);
                    }
                    let nextUserMessage = toolResults;
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
                }
                catch (error) {
                    console.error("Error in agent tool call:", error);
                    return { success: false, error: error instanceof Error ? error.message : String(error), message: null };
                }
            }
            catch (error) {
                console.error("Error in agent tool call:", error);
                return { success: false, error: error instanceof Error ? error.message : String(error), message: null };
            }
        }
        return {
            success: completed,
            error: null,
            message: ((_b = this.apiConversationHistory
                .filter(msg => msg.role === 'assistant')
                .pop()) === null || _b === void 0 ? void 0 : _b.content) || ''
        };
    }
    /**
     * Attempts to make a request to the LLM with conversation history and tools.
     *
     * @param apiConversationHistory - The current conversation history
     * @param tools - The tools available to the LLM
     * @returns Promise with the LLM response
     */
    async attemptLlmRequest(apiConversationHistory, tools) {
        try {
            let systemPrompt = await this.systemPrompt.toPromptText();
            const aiMessages = [
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
            const { completion } = await llm_1.default.inference(createParams);
            return completion;
        }
        catch (error) {
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
    async executeTool(toolName, toolInput) {
        //codebolttools--readfile
        const [toolboxName, actualToolName] = toolName.split('--');
        return tools_1.default.executeTool(toolboxName, actualToolName, toolInput);
    }
    /**
     * Starts a sub-agent to handle a specific task.
     *
     * @param agentName - The name of the sub-agent to start
     * @param params - Parameters for the sub-agent
     * @returns Promise with tuple [userRejected, result]
     */
    async startSubAgent(agentName, params) {
        return agent_1.default.startAgent(agentName, params.task);
    }
    /**
     * Extracts tool details from a tool call object.
     *
     * @param tool - The tool call object from the LLM response
     * @returns ToolDetails object with name, input, and ID
     */
    getToolDetail(tool) {
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
    getToolResult(tool_call_id, content) {
        let userMessage = undefined;
        try {
            let parsed = JSON.parse(content);
            if (parsed.payload && parsed.payload.content) {
                content = `The browser action has been executed. The  screenshot have been captured for your analysis. The tool response is provided in the next user message`;
                // this.apiConversationHistory.push()
                userMessage = parsed.payload.content;
            }
        }
        catch (error) {
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
    attemptApiRequest() {
        throw new Error("API request fallback not implemented");
    }
}
exports.Agent = Agent;
