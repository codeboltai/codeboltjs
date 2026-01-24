import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import actionPlan from '../../modules/actionPlan';

export interface GetAllActionPlansParams {
    explanation?: string;
}

class GetAllActionPlansInvocation extends BaseToolInvocation<GetAllActionPlansParams, ToolResult> {
    constructor(params: GetAllActionPlansParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await actionPlan.getAllPlans();
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }

            const plans = response.plans || [];
            const content = `Found ${plans.length} action plans:\n${plans.map((p: any) => `- ${p.planId}: ${p.name} (${p.status})`).join('\n')}`;

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

export class GetAllActionPlansTool extends BaseDeclarativeTool<GetAllActionPlansParams, ToolResult> {
    constructor() {
        super('actionPlan_getAll', 'Get All Action Plans', 'Get all action plans', Kind.Other, {
            type: 'object',
            properties: {
                explanation: { type: 'string', description: 'Explanation' },
            },
        });
    }

    protected override createInvocation(params: GetAllActionPlansParams): ToolInvocation<GetAllActionPlansParams, ToolResult> {
        return new GetAllActionPlansInvocation(params);
    }
}
