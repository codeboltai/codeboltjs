/**
 * File Intent Check Overlap Tool - Checks for overlapping intents without creating
 * Wraps the SDK's fileUpdateIntentService.checkOverlap() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import fileUpdateIntentService from '../../modules/fileUpdateIntent';

export interface FileIntentCheckOverlapParams {
    /** Environment ID to check in */
    environmentId: string;
    /** List of file paths to check */
    filePaths: string[];
    /** Priority level for the check (optional, default: 5) */
    priority?: number;
}

class FileIntentCheckOverlapInvocation extends BaseToolInvocation<FileIntentCheckOverlapParams, ToolResult> {
    constructor(params: FileIntentCheckOverlapParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const result = await fileUpdateIntentService.checkOverlap(
                this.params.environmentId,
                this.params.filePaths,
                this.params.priority ?? 5
            );

            let output = `Overlap Check Result:`;
            output += `\nHas Overlap: ${result.hasOverlap}`;
            output += `\nCan Proceed: ${result.canProceed}`;

            if (result.blockedFiles.length > 0) {
                output += `\nBlocked Files (Level 4 locks): ${result.blockedFiles.join(', ')}`;
            }

            if (result.overlappingIntents.length > 0) {
                output += `\n\nOverlapping Intents:`;
                for (const overlap of result.overlappingIntents) {
                    output += `\n  - Intent ${overlap.intentId}`;
                    output += `\n    Claimed by: ${overlap.claimedByName || overlap.claimedBy}`;
                    output += `\n    Files: ${overlap.files.join(', ')}`;
                    output += `\n    Levels: ${overlap.intentLevels.join(', ')}`;
                    output += `\n    Priority: ${overlap.priority}`;
                }
            }

            if (result.message) {
                output += `\n\nMessage: ${result.message}`;
            }

            return {
                llmContent: output,
                returnDisplay: result.hasOverlap
                    ? `Overlap detected: ${result.overlappingIntents.length} intent(s)`
                    : 'No overlap detected',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error checking overlap: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class FileIntentCheckOverlapTool extends BaseDeclarativeTool<FileIntentCheckOverlapParams, ToolResult> {
    static readonly Name: string = 'file_intent_check_overlap';

    constructor() {
        super(
            FileIntentCheckOverlapTool.Name,
            'FileIntentCheckOverlap',
            'Checks if there are overlapping intents on specified files without creating an intent. Useful for planning before claiming files.',
            Kind.Read,
            {
                properties: {
                    environmentId: {
                        description: 'The environment ID to check in.',
                        type: 'string',
                    },
                    filePaths: {
                        description: 'List of file paths to check for overlaps.',
                        type: 'array',
                        items: { type: 'string' },
                    },
                    priority: {
                        description: 'Priority level for the check (optional, default: 5).',
                        type: 'number',
                        minimum: 1,
                        maximum: 10,
                    },
                },
                required: ['environmentId', 'filePaths'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: FileIntentCheckOverlapParams): string | null {
        if (!params.environmentId || params.environmentId.trim() === '') {
            return "'environmentId' is required";
        }
        if (!params.filePaths || params.filePaths.length === 0) {
            return "'filePaths' array is required and must not be empty";
        }
        return null;
    }

    protected createInvocation(params: FileIntentCheckOverlapParams): ToolInvocation<FileIntentCheckOverlapParams, ToolResult> {
        return new FileIntentCheckOverlapInvocation(params);
    }
}
