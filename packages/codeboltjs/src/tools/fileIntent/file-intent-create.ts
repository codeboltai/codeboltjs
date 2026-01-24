/**
 * File Intent Create Tool - Creates a new file update intent
 * Wraps the SDK's fileUpdateIntentService.create() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import fileUpdateIntentService from '../../modules/fileUpdateIntent';
import type { FileIntent, IntentLevel } from '../../types/fileUpdateIntent';

export interface FileIntentCreateParams {
    /** Environment ID for the intent */
    environmentId: string;
    /** List of files with their intent levels */
    files: Array<{
        filePath: string;
        intentLevel: IntentLevel;
        targetSections?: string[];
    }>;
    /** Description of the intended change */
    description: string;
    /** Agent ID who is claiming this intent */
    claimedBy: string;
    /** Display name of the agent (optional) */
    claimedByName?: string;
    /** Estimated duration in minutes (optional) */
    estimatedDuration?: number;
    /** Priority 1-10, higher = more important (optional, default: 5) */
    priority?: number;
    /** Whether to auto-expire (optional, default: false) */
    autoExpire?: boolean;
    /** Max duration before auto-expire in minutes (optional, default: 60) */
    maxAutoExpireMinutes?: number;
}

class FileIntentCreateInvocation extends BaseToolInvocation<FileIntentCreateParams, ToolResult> {
    constructor(params: FileIntentCreateParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const { claimedBy, claimedByName, ...requestData } = this.params;
            const response = await fileUpdateIntentService.create(requestData, claimedBy, claimedByName);

            if (response.overlap && response.overlap.hasOverlap && !response.overlap.canProceed) {
                const blockedFilesInfo = response.overlap.blockedFiles.length > 0
                    ? `\nBlocked files: ${response.overlap.blockedFiles.join(', ')}`
                    : '';
                const message = response.overlap.message || 'Intent creation blocked due to overlap';

                return {
                    llmContent: `File intent creation blocked: ${message}${blockedFilesInfo}`,
                    returnDisplay: `Warning: ${message}${blockedFilesInfo}`,
                    error: {
                        message: message,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const intent = response.intent;
            let output = `Created file update intent: ${intent?.id}`;
            output += `\nEnvironment: ${intent?.environmentId}`;
            output += `\nDescription: ${intent?.description}`;
            output += `\nFiles: ${intent?.files.map(f => f.filePath).join(', ')}`;
            output += `\nClaimed by: ${intent?.claimedByName || intent?.claimedBy}`;
            output += `\nStatus: ${intent?.status}`;

            if (response.overlap && response.overlap.hasOverlap) {
                output += `\n\nNote: Overlap detected but proceeding. ${response.overlap.message || ''}`;
            }

            return {
                llmContent: output,
                returnDisplay: `Created file intent: ${intent?.id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error creating file intent: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class FileIntentCreateTool extends BaseDeclarativeTool<FileIntentCreateParams, ToolResult> {
    static readonly Name: string = 'file_intent_create';

    constructor() {
        super(
            FileIntentCreateTool.Name,
            'FileIntentCreate',
            'Creates a new file update intent to declare files an agent intends to modify. Returns overlap information if other agents have intents on the same files.',
            Kind.Execute,
            {
                properties: {
                    environmentId: {
                        description: 'The environment ID for the intent.',
                        type: 'string',
                    },
                    files: {
                        description: 'List of files with their intent levels. Each file has filePath (string), intentLevel (1-4), and optional targetSections (string array).',
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                filePath: { type: 'string' },
                                intentLevel: { type: 'number', minimum: 1, maximum: 4 },
                                targetSections: { type: 'array', items: { type: 'string' } },
                            },
                            required: ['filePath', 'intentLevel'],
                        },
                    },
                    description: {
                        description: 'Description of the intended change.',
                        type: 'string',
                    },
                    claimedBy: {
                        description: 'Agent ID who is claiming this intent.',
                        type: 'string',
                    },
                    claimedByName: {
                        description: 'Display name of the agent (optional).',
                        type: 'string',
                    },
                    estimatedDuration: {
                        description: 'Estimated duration in minutes (optional).',
                        type: 'number',
                    },
                    priority: {
                        description: 'Priority 1-10, higher = more important (optional, default: 5).',
                        type: 'number',
                        minimum: 1,
                        maximum: 10,
                    },
                    autoExpire: {
                        description: 'Whether to auto-expire (optional, default: false).',
                        type: 'boolean',
                    },
                    maxAutoExpireMinutes: {
                        description: 'Max duration before auto-expire in minutes (optional, default: 60).',
                        type: 'number',
                    },
                },
                required: ['environmentId', 'files', 'description', 'claimedBy'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: FileIntentCreateParams): string | null {
        if (!params.environmentId || params.environmentId.trim() === '') {
            return "'environmentId' is required";
        }
        if (!params.files || params.files.length === 0) {
            return "'files' array is required and must not be empty";
        }
        if (!params.description || params.description.trim() === '') {
            return "'description' is required";
        }
        if (!params.claimedBy || params.claimedBy.trim() === '') {
            return "'claimedBy' is required";
        }
        return null;
    }

    protected createInvocation(params: FileIntentCreateParams): ToolInvocation<FileIntentCreateParams, ToolResult> {
        return new FileIntentCreateInvocation(params);
    }
}
