import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbutils from '../../modules/utils';

export interface UtilsEditFileAndApplyDiffParams {
    filePath: string;
    diff: string;
    diffIdentifier: string;
    prompt: string;
    applyModel?: string;
}

class UtilsEditFileAndApplyDiffInvocation extends BaseToolInvocation<UtilsEditFileAndApplyDiffParams, ToolResult> {
    constructor(params: UtilsEditFileAndApplyDiffParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbutils.editFileAndApplyDiff(
                this.params.filePath,
                this.params.diff,
                this.params.diffIdentifier,
                this.params.prompt,
                this.params.applyModel
            );
            
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            
            return {
                llmContent: `File edited and diff applied successfully: ${this.params.filePath}`,
                returnDisplay: JSON.stringify(response, null, 2),
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

export class UtilsEditFileAndApplyDiffTool extends BaseDeclarativeTool<UtilsEditFileAndApplyDiffParams, ToolResult> {
    constructor() {
        super(
            'utils_edit_file_and_apply_diff',
            'Edit File and Apply Diff',
            'Edits a file and applies a diff with AI assistance',
            Kind.Edit,
            {
                type: 'object',
                properties: {
                    filePath: { type: 'string', description: 'The path to the file to edit' },
                    diff: { type: 'string', description: 'The diff to apply' },
                    diffIdentifier: { type: 'string', description: 'The identifier for the diff' },
                    prompt: { type: 'string', description: 'The prompt for the AI model' },
                    applyModel: { type: 'string', description: 'Optional model to use for applying the diff' },
                },
                required: ['filePath', 'diff', 'diffIdentifier', 'prompt'],
            }
        );
    }

    protected override createInvocation(params: UtilsEditFileAndApplyDiffParams): ToolInvocation<UtilsEditFileAndApplyDiffParams, ToolResult> {
        return new UtilsEditFileAndApplyDiffInvocation(params);
    }
}
