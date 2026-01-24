import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import actionPlan from '../../modules/actionPlan';

export interface CreateActionPlanParams {
    name: string;
    description?: string;
    agentId?: string;
    agentName?: string;
    status?: string;
    planId?: string;
    explanation?: string;
}

class CreateActionPlanInvocation extends BaseToolInvocation<CreateActionPlanParams, ToolResult> {
    constructor(params: CreateActionPlanParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const { name, description, agentId, agentName, status, planId } = this.params;
            const response = await actionPlan.createActionPlan({ name, description, agentId, agentName, status, planId });

            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }

            const content = `Action plan "${name}" created successfully. ID: ${response.plan?.planId}`;
            return { llmContent: content, returnDisplay: content };
        } catch (error) {
            return {
                llmContent: `Error: ${error}`,
                returnDisplay: `Error: ${error}`,
                error: { message: String(error), type: ToolErrorType.EXECUTION_FAILED },
            };
        }
    }
}

export class CreateActionPlanTool extends BaseDeclarativeTool<CreateActionPlanParams, ToolResult> {
    constructor() {
        super('actionPlan_create', 'Create Action Plan', 'Create a new action plan', Kind.Other, {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Plan name' },
                description: { type: 'string', description: 'Plan description' },
                agentId: { type: 'string', description: 'Agent ID' },
                agentName: { type: 'string', description: 'Agent name' },
                status: { type: 'string', description: 'Plan status' },
                planId: { type: 'string', description: 'Plan ID' },
                explanation: { type: 'string', description: 'Explanation' },
            },
            required: ['name'],
        });
    }

    protected override createInvocation(params: CreateActionPlanParams): ToolInvocation<CreateActionPlanParams, ToolResult> {
        return new CreateActionPlanInvocation(params);
    }
}
