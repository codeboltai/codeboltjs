import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import rag from '../../modules/rag';

export interface RAGRetrieveKnowledgeParams {
    query: string;
    filename: string;
    explanation?: string;
}

class RAGRetrieveKnowledgeInvocation extends BaseToolInvocation<RAGRetrieveKnowledgeParams, ToolResult> {
    constructor(params: RAGRetrieveKnowledgeParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const result = await rag.retrieve_related_knowledge(this.params.query, this.params.filename);
            return {
                llmContent: `Related knowledge:\n${result}`,
                returnDisplay: `Retrieved knowledge for "${this.params.query}"`,
            };
        } catch (error) {
            return {
                llmContent: `Error: ${error}`,
                returnDisplay: `Error: ${error}`,
                error: { message: String(error), type: ToolErrorType.EXECUTION_FAILED },
            };
        }
    }
}

export class RAGRetrieveKnowledgeTool extends BaseDeclarativeTool<RAGRetrieveKnowledgeParams, ToolResult> {
    constructor() {
        super('rag_retrieve_knowledge', 'Retrieve RAG Knowledge', 'Retrieve related knowledge from RAG', Kind.Other, {
            type: 'object',
            properties: {
                query: { type: 'string', description: 'Query' },
                filename: { type: 'string', description: 'Filename' },
                explanation: { type: 'string', description: 'Explanation' },
            },
            required: ['query', 'filename'],
        });
    }

    protected override createInvocation(params: RAGRetrieveKnowledgeParams): ToolInvocation<RAGRetrieveKnowledgeParams, ToolResult> {
        return new RAGRetrieveKnowledgeInvocation(params);
    }
}
