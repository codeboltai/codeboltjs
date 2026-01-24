/**
 * Codemap Create Tool - Creates a new codemap placeholder
 * Wraps the SDK's codeboltCodemap.create() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltCodemap from '../../modules/codemap';

/**
 * Parameters for the CodemapCreate tool
 */
export interface CodemapCreateToolParams {
    /**
     * The title of the new codemap
     */
    title: string;

    /**
     * Optional query/description for the codemap
     */
    query?: string;

    /**
     * Optional project path
     */
    project_path?: string;
}

class CodemapCreateToolInvocation extends BaseToolInvocation<
    CodemapCreateToolParams,
    ToolResult
> {
    constructor(params: CodemapCreateToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const createData = {
                title: this.params.title,
                query: this.params.query,
            };

            const response = await codeboltCodemap.create(
                createData,
                this.params.project_path
            );

            if (!response || !response.codemap) {
                return {
                    llmContent: 'Failed to create codemap. No response received.',
                    returnDisplay: 'Failed to create codemap',
                    error: {
                        message: 'Failed to create codemap',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const llmContent = JSON.stringify({
                message: 'Codemap created successfully',
                codemap: response.codemap,
            }, null, 2);

            return {
                llmContent,
                returnDisplay: `Created codemap: ${response.codemap.title} (ID: ${response.codemap.id})`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error creating codemap: ${errorMessage}`,
                returnDisplay: `Error creating codemap: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the CodemapCreate tool
 */
export class CodemapCreateTool extends BaseDeclarativeTool<
    CodemapCreateToolParams,
    ToolResult
> {
    static readonly Name: string = 'codemap_create';

    constructor() {
        super(
            CodemapCreateTool.Name,
            'CodemapCreate',
            'Creates a new codemap placeholder with the specified title. The codemap is created with status "creating" and can be populated with content using other codemap operations.',
            Kind.Edit,
            {
                properties: {
                    title: {
                        description:
                            'The title for the new codemap.',
                        type: 'string',
                    },
                    query: {
                        description:
                            'Optional query or description for the codemap that describes what code structure it represents.',
                        type: 'string',
                    },
                    project_path: {
                        description:
                            'Optional project path. If not provided, uses the current project.',
                        type: 'string',
                    },
                },
                required: ['title'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: CodemapCreateToolParams,
    ): string | null {
        if (!params.title || params.title.trim() === '') {
            return "The 'title' parameter must be non-empty.";
        }
        return null;
    }

    protected createInvocation(
        params: CodemapCreateToolParams,
    ): ToolInvocation<CodemapCreateToolParams, ToolResult> {
        return new CodemapCreateToolInvocation(params);
    }
}
