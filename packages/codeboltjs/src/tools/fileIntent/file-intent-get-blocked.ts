/**
 * File Intent Get Blocked Tool - Gets files that are hard-locked (level 4)
 * Wraps the SDK's fileUpdateIntentService.getBlockedFiles() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import fileUpdateIntentService from '../../modules/fileUpdateIntent';

export interface FileIntentGetBlockedParams {
    /** Environment ID to check */
    environmentId: string;
}

class FileIntentGetBlockedInvocation extends BaseToolInvocation<FileIntentGetBlockedParams, ToolResult> {
    constructor(params: FileIntentGetBlockedParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const result = await fileUpdateIntentService.getBlockedFiles(this.params.environmentId);

            if (!result.blockedFiles || result.blockedFiles.length === 0) {
                return {
                    llmContent: 'No blocked files found in this environment.',
                    returnDisplay: 'No blocked files',
                };
            }

            let output = `Blocked Files (Level 4 Hard Locks):`;
            output += `\nEnvironment: ${this.params.environmentId}`;
            output += `\nCount: ${result.blockedFiles.length}`;
            output += `\n\nFiles:`;
            for (const file of result.blockedFiles) {
                output += `\n  - ${file}`;
            }

            return {
                llmContent: output,
                returnDisplay: `${result.blockedFiles.length} blocked file(s)`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting blocked files: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class FileIntentGetBlockedTool extends BaseDeclarativeTool<FileIntentGetBlockedParams, ToolResult> {
    static readonly Name: string = 'file_intent_get_blocked';

    constructor() {
        super(
            FileIntentGetBlockedTool.Name,
            'FileIntentGetBlocked',
            'Gets all files that are hard-locked (level 4 intents) in an environment. These files cannot be modified by other agents.',
            Kind.Read,
            {
                properties: {
                    environmentId: {
                        description: 'The environment ID to check for blocked files.',
                        type: 'string',
                    },
                },
                required: ['environmentId'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: FileIntentGetBlockedParams): string | null {
        if (!params.environmentId || params.environmentId.trim() === '') {
            return "'environmentId' is required";
        }
        return null;
    }

    protected createInvocation(params: FileIntentGetBlockedParams): ToolInvocation<FileIntentGetBlockedParams, ToolResult> {
        return new FileIntentGetBlockedInvocation(params);
    }
}
