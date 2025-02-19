import chatlib from "./../chat"
import mcp from "./../mcp"
import llm from "./../llm"
import codeboltAgent from "./../agent"
import { SystemPrompt } from "./systemprompt";
import { TaskInstruction } from "./taskInstruction";

interface Message {
    role: 'user' | 'assistant' | 'tool' | 'system';
    content: any[] | string;
    tool_call_id?: string;
    [key: string]: any;
}

interface ToolResult {
    role: 'tool';
    tool_call_id: string;
    content: any;
}

interface ToolDetails {
    toolName: string;
    toolInput: any;
    toolUseId: string;
}

class Agent {
    private tools: any[];
    private subAgents: any[];
    private apiConversationHistory: Message[];
    private maxRun: number;
    private systemPrompt: SystemPrompt;
    private userMessage: Message[];


    constructor(tools: any = [], systemPrompt: SystemPrompt, maxRun: number = 0, subAgents: any[] = []) {
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

    async run(task: TaskInstruction, successCondition: () => boolean = () => true): Promise<{ success: boolean; error: string | null, message: string | null }> {


        let mentaionedMCPSTool: any[] = await task.userMessage.getMentionedMcpsTools();
        this.tools = [
            ...this.tools,
            ...mentaionedMCPSTool
        ]


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
                            const { toolInput, toolName, toolUseId } = this.getToolDetail(tool);

                            if (!userRejectedToolUse) {
                                if (toolName.includes("attempt_completion")) {
                                    taskCompletedBlock = tool;
                                } else {

                                    let [serverName] = toolName.replace('--', ':').split(':');


                                    if (serverName == 'subagent') {
                                        console.log("calling agent with params", toolName, toolInput);

                                        const agentResponse = await codeboltAgent.startAgent(toolName.replace("subagent--", ''), toolInput.task);
                                        console.log("got sub agent resonse  result", agentResponse);
                                        const [didUserReject, result] = [false,"tool result is successful"];
                                       console.log("got sub agent resonse  result", didUserReject, result); 
                                      
                                        toolResults.push(this.getToolResult(toolUseId, result));
                                        if (didUserReject) {
                                            userRejectedToolUse = true;
                                        }
                                    }
                                    else {
                                        console.log("calling tool with params", toolName, toolInput);
                                        const [didUserReject, result] = await this.executeTool(toolName, toolInput);
                                        console.log("tool result", result);
                                        toolResults.push(this.getToolResult(toolUseId, result));

                                        if (didUserReject) {
                                            userRejectedToolUse = true;
                                        }
                                    }

                                }
                            } else {
                                toolResults.push(this.getToolResult(toolUseId, "Skipping tool execution due to previous tool user rejection."));
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
                        toolResults.push(this.getToolResult(taskCompletedBlock.id, result));
                    }

                    this.apiConversationHistory.push(...toolResults);
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
            console.log(error);
            return this.attemptApiRequest();
        }
    }

    private async executeTool(toolName: string, toolInput: any): Promise<[boolean, any]> {
        return mcp.executeTool(toolName, toolInput);
    }
    private async startSubAgent(agentName: string, params: any): Promise<[boolean, any]> {
        return codeboltAgent.startAgent(agentName, params.task);
    }

    private getToolDetail(tool: any): ToolDetails {
        return {
            toolName: tool.function.name,
            toolInput: JSON.parse(tool.function.arguments || "{}"),
            toolUseId: tool.id
        };
    }

    private getToolResult(tool_call_id: string, content: any): ToolResult {
        return {
            role: "tool",
            tool_call_id,
            content,
        };
    }

    // Placeholder for error fallback method
    private attemptApiRequest(): any {
        throw new Error("API request fallback not implemented");
    }
}

export { Agent };