/**
 * Codemap Get Tool - Gets a specific codemap by ID
 * Wraps the SDK's codeboltCodemap.get() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltCodemap from '../../modules/codemap';

/**
 * Parameters for the CodemapGet tool
 */
export interface CodemapGetToolParams {
    /**
     * The ID of the codemap to retrieve
     */
    codemap_id: string;

    /**
     * Optional project path
     */
    project_path?: string;
}

class CodemapGetToolInvocation extends BaseToolInvocation<
    CodemapGetToolParams,
    ToolResult
> {
    constructor(params: CodemapGetToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await codeboltCodemap.get(
                this.params.codemap_id,
                this.params.project_path
            );

            if (!response.success) {
                const errorMsg = response.error?.message || response.message || 'Unknown error';
                return {
                    llmContent: `Error getting codemap: ${errorMsg}`,
                    returnDisplay: `Error getting codemap: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            if (!response.data?.codemap) {
                return {
                    llmContent: `Codemap with ID '${this.params.codemap_id}' not found.`,
                    returnDisplay: `Codemap not found: ${this.params.codemap_id}`,
                    error: {
                        message: `Codemap with ID '${this.params.codemap_id}' not found`,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const llmContent = JSON.stringify(response.data.codemap, null, 2);

            return {
                llmContent,
                returnDisplay: `Retrieved codemap: ${response.data.codemap.title}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting codemap: ${errorMessage}`,
                returnDisplay: `Error getting codemap: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the CodemapGet tool
 */
export class CodemapGetTool extends BaseDeclarativeTool<
    CodemapGetToolParams,
    ToolResult
> {
    static readonly Name: string = 'codemap_get';

    constructor() {
        super(
            CodemapGetTool.Name,
            'CodemapGet',
            'Gets a specific codemap by its ID. Returns the full codemap structure including sections, files, and metadata.',
            Kind.Read,
            {
                properties: {
                    codemap_id: {
                        description:
                            'The unique identifier of the codemap to retrieve.',
                        type: 'string',
                    },
                    project_path: {
                        description:
                            'Optional project path. If not provided, uses the current project.',
                        type: 'string',
                    },
                },
                required: ['codemap_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: CodemapGetToolParams,
    ): string | null {
        if (!params.codemap_id || params.codemap_id.trim() === '') {
            return "The 'codemap_id' parameter must be non-empty.";
        }
        return null;
    }

    protected createInvocation(
        params: CodemapGetToolParams,
    ): ToolInvocation<CodemapGetToolParams, ToolResult> {
        return new CodemapGetToolInvocation(params);
    }
}
