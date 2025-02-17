import { SystemPrompt } from "./systemprompt";
import { TaskInstruction } from "./taskInstruction";
declare class Agent {
    private tools;
    private subAgents;
    private apiConversationHistory;
    private maxRun;
    private systemPrompt;
    private userMessage;
    constructor(tools: any | undefined, systemPrompt: SystemPrompt, maxRun?: number, subAgents?: Agent[]);
    run(task: TaskInstruction, successCondition?: () => boolean): Promise<{
        success: boolean;
        error: string | null;
    }>;
    private attemptLlmRequest;
    private executeTool;
    private getToolDetail;
    private getToolResult;
    private attemptApiRequest;
}
export { Agent };
