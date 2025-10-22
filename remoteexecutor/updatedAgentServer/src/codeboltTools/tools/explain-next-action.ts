/**
 * Explain Next Action Tool - Provides a brief explanation of what is going to happen next
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import { Kind } from '../types';

/**
 * Parameters for the ExplainNextAction tool
 */
export interface ExplainNextActionToolParams {
    /**
     * A brief explanation (1-2 sentences) of what is going to happen next
     */
    explanation: string;
}

class ExplainNextActionToolInvocation extends BaseToolInvocation<
    ExplainNextActionToolParams,
    ToolResult
> {
    constructor(
        params: ExplainNextActionToolParams,
    ) {
        super(params);
    }

    getDescription(): string {
        return `Explaining next action: ${this.params.explanation}`;
    }

    async execute(): Promise<ToolResult> {
        // Simply return the explanation as both LLM content and display result
        const explanation = this.params.explanation;



        return {
            llmContent: "explanation sent successfully",
            returnDisplay: explanation,
        };
    }
}

/**
 * Implementation of the ExplainNextAction tool logic
 */
export class ExplainNextActionTool extends BaseDeclarativeTool<
    ExplainNextActionToolParams,
    ToolResult
> {
    static readonly Name: string = 'explain_next_action';

    constructor() {
        super(
            ExplainNextActionTool.Name,
            'ExplainNextAction',
            `Definition: A brief progress note (1-3 sentences) about what just happened, what you're about to do, blockers/risks if relevant. Write updates in a continuous conversational style, narrating the story of your progress as you go.`,
            Kind.Other,
            {
                properties: {
                    explanation: {
                        description: "A brief progress note (1-3 sentences) about what just happened, what you're about to do, blockers/risks if relevant. Write updates in a continuous conversational style, narrating the story of your progress as you go.",
                        type: 'string',
                    },
                },
                required: ['explanation'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: ExplainNextActionToolParams,
    ): string | null {
        if (!params.explanation || params.explanation.trim() === '') {
            return "The 'explanation' parameter must be non-empty.";
        }

        // Check if explanation is too long (more than 3 sentences or 500 characters)
        const sentences = params.explanation.trim().split(/[.!?]+/).filter(s => s.trim().length > 0);
        if (sentences.length > 3 || params.explanation.length > 500) {
            return "The 'explanation' parameter should be brief (1-2 sentences, less than 500 characters).";
        }

        return null;
    }

    protected createInvocation(
        params: ExplainNextActionToolParams,
    ): ToolInvocation<ExplainNextActionToolParams, ToolResult> {
        return new ExplainNextActionToolInvocation(params);
    }
}