import { SystemPrompt } from "./systemprompt";
import { TaskInstruction } from "./taskInstruction";
declare class Agent {
    private tools;
    private subAgents;
    private apiConversationHistory;
    private maxRun;
    private systemPrompt;
    private userMessage;
    private nextUserMessage;
    constructor(tools: any, systemPrompt: SystemPrompt, maxRun?: number, subAgents?: any[]);
    run(task: TaskInstruction, successCondition?: () => boolean): Promise<{
        success: boolean;
        error: string | null;
        message: string | null;
    }>;
    private attemptLlmRequest;
    private executeTool;
    private startSubAgent;
    private getToolDetail;
    private getToolResult;
    private attemptApiRequest;
}
export { Agent };
