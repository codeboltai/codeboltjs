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
class Agent {
    constructor(tools = [], systemPrompt, maxRun = 0, subAgents = []) {
        this.tools = tools;
        this.userMessage = [];
        this.apiConversationHistory = [];
        this.maxRun = maxRun;
        this.systemPrompt = systemPrompt;
        this.subAgents = subAgents;
        this.subAgents = subAgents.map(subagent => {
            subagent.function.name = `subagent--${subagent.function.name}`;
            return subagent;
        });
        this.tools = this.tools.concat(subAgents.map(subagent => ({
            ...subagent
        })));
    }
    async run(task, successCondition = () => true) {
        var _a, _b;
        let mentaionedMCPSTool = await task.userMessage.getMentionedMcpsTools();
        this.tools = [
            ...this.tools,
            ...mentaionedMCPSTool
        ];
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
                                        console.log("calling agent with params", toolName, toolInput);
                                        const agentResponse = await agent_1.default.startAgent(toolName.replace("subagent--", ''), toolInput.task);
                                        console.log("got sub agent resonse  result", agentResponse);
                                        const [didUserReject, result] = [false, "tool result is successful"];
                                        console.log("got sub agent resonse  result", didUserReject, result);
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
                                        console.log("calling tool with params", toolName, toolInput);
                                        const [didUserReject, result] = await this.executeTool(toolName, toolInput);
                                        console.log("tool result", result);
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
            console.log(error);
            return this.attemptApiRequest();
        }
    }
    async executeTool(toolName, toolInput) {
        //codebolttools--readfile
        const [toolboxName, actualToolName] = toolName.split('--');
        return tools_1.default.executeTool(toolboxName, actualToolName, toolInput);
    }
    async startSubAgent(agentName, params) {
        return agent_1.default.startAgent(agentName, params.task);
    }
    getToolDetail(tool) {
        return {
            toolName: tool.function.name,
            toolInput: JSON.parse(tool.function.arguments || "{}"),
            toolUseId: tool.id
        };
    }
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
    // Placeholder for error fallback method
    attemptApiRequest() {
        throw new Error("API request fallback not implemented");
    }
}
exports.Agent = Agent;
