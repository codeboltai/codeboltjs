/**
 * File Intent Get Files With Intents Tool - Gets all files that have active intents
 * Wraps the SDK's fileUpdateIntentService.getFilesWithIntents() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import fileUpdateIntentService from '../../modules/fileUpdateIntent';

export interface FileIntentGetFilesWithIntentsParams {
    /** Environment ID to check */
    environmentId: string;
}

class FileIntentGetFilesWithIntentsInvocation extends BaseToolInvocation<FileIntentGetFilesWithIntentsParams, ToolResult> {
    constructor(params: FileIntentGetFilesWithIntentsParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const filesWithIntents = await fileUpdateIntentService.getFilesWithIntents(this.params.environmentId);

            if (!filesWithIntents || filesWithIntents.length === 0) {
                return {
                    llmContent: 'No files with active intents found in this environment.',
                    returnDisplay: 'No files with intents',
                };
            }

            let output = `Files With Active Intents:`;
            output += `\nEnvironment: ${this.params.environmentId}`;
            output += `\nCount: ${filesWithIntents.length}`;
            output += `\n`;

            for (const fileWithIntent of filesWithIntents) {
                output += `\n- ${fileWithIntent.filePath}`;
                output += `\n    Intent ID: ${fileWithIntent.intentId}`;
                output += `\n    Claimed by: ${fileWithIntent.claimedByName || fileWithIntent.claimedBy}`;
                output += `\n    Level: ${fileWithIntent.intentLevel}`;
                output += `\n    Priority: ${fileWithIntent.priority}`;
            }

            return {
                llmContent: output,
                returnDisplay: `${filesWithIntents.length} file(s) with intents`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting files with intents: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class FileIntentGetFilesWithIntentsTool extends BaseDeclarativeTool<FileIntentGetFilesWithIntentsParams, ToolResult> {
    static readonly Name: string = 'file_intent_get_files_with_intents';

    constructor() {
        super(
            FileIntentGetFilesWithIntentsTool.Name,
            'FileIntentGetFilesWithIntents',
            'Gets all files that have active intents in an environment, showing which files are currently reserved and by whom.',
            Kind.Read,
            {
                properties: {
                    environmentId: {
                        description: 'The environment ID to check for files with intents.',
                        type: 'string',
                    },
                },
                required: ['environmentId'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: FileIntentGetFilesWithIntentsParams): string | null {
        if (!params.environmentId || params.environmentId.trim() === '') {
            return "'environmentId' is required";
        }
        return null;
    }

    protected createInvocation(params: FileIntentGetFilesWithIntentsParams): ToolInvocation<FileIntentGetFilesWithIntentsParams, ToolResult> {
        return new FileIntentGetFilesWithIntentsInvocation(params);
    }
}
