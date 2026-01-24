import type { ToolInvocation, ToolResult, ToolLocation } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import rag from '../../modules/rag';

export interface RAGAddFileParams {
    filename: string;
    filePath: string;
    explanation?: string;
}

class RAGAddFileInvocation extends BaseToolInvocation<RAGAddFileParams, ToolResult> {
    constructor(params: RAGAddFileParams) {
        super(params);
    }

    override toolLocations(): ToolLocation[] {
        return [{ path: this.params.filePath }];
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            rag.add_file(this.params.filename, this.params.filePath);
            return {
                llmContent: `File "${this.params.filename}" added to RAG system`,
                returnDisplay: `File added to RAG: ${this.params.filename}`,
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

export class RAGAddFileTool extends BaseDeclarativeTool<RAGAddFileParams, ToolResult> {
    constructor() {
        super('rag_add_file', 'Add File to RAG', 'Add a file to the RAG system', Kind.Other, {
            type: 'object',
            properties: {
                filename: { type: 'string', description: 'File name' },
                filePath: { type: 'string', description: 'File path' },
                explanation: { type: 'string', description: 'Explanation' },
            },
            required: ['filename', 'filePath'],
        });
    }

    protected override createInvocation(params: RAGAddFileParams): ToolInvocation<RAGAddFileParams, ToolResult> {
        return new RAGAddFileInvocation(params);
    }
}
