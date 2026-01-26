/**
 * Mail Release Files Tool - Releases file reservations
 * Wraps the SDK's cbmail.releaseFiles() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import mailService from '../../modules/mail';

/**
 * Parameters for the MailReleaseFiles tool
 */
export interface MailReleaseFilesToolParams {
    /**
     * The agent ID releasing the reservation
     */
    agentId: string;

    /**
     * The file paths to release
     */
    files: string[];
}

class MailReleaseFilesToolInvocation extends BaseToolInvocation<
    MailReleaseFilesToolParams,
    ToolResult
> {
    constructor(params: MailReleaseFilesToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            // Map files to paths for the SDK call
            const response = await mailService.releaseFiles({
                paths: this.params.files,
                agentId: this.params.agentId,
            } as any);

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully released ${this.params.files.length} file(s)`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the MailReleaseFiles tool
 */
export class MailReleaseFilesTool extends BaseDeclarativeTool<
    MailReleaseFilesToolParams,
    ToolResult
> {
    static readonly Name: string = 'mail_release_files';

    constructor() {
        super(
            MailReleaseFilesTool.Name,
            'MailReleaseFiles',
            'Releases file reservations held by an agent.',
            Kind.Edit,
            {
                properties: {
                    agentId: {
                        description: 'The agent ID releasing the reservation',
                        type: 'string',
                    },
                    files: {
                        description: 'The file paths to release',
                        type: 'array',
                        items: { type: 'string' },
                    },
                },
                required: ['agentId', 'files'],
                type: 'object',
            },
        );
    }

    protected createInvocation(
        params: MailReleaseFilesToolParams,
    ): ToolInvocation<MailReleaseFilesToolParams, ToolResult> {
        return new MailReleaseFilesToolInvocation(params);
    }
}
