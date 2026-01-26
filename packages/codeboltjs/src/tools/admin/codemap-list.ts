/**
 * Codemap List Tool - Lists all codemaps for a project
 * Wraps the SDK's codeboltCodemap.list() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltCodemap from '../../modules/codemap';

/**
 * Parameters for the CodemapList tool
 */
export interface CodemapListToolParams {
    /**
     * Optional project path to list codemaps for
     */
    project_path?: string;
}

class CodemapListToolInvocation extends BaseToolInvocation<
    CodemapListToolParams,
    ToolResult
> {
    constructor(params: CodemapListToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await codeboltCodemap.list(this.params.project_path);

            if (!response.success) {
                const errorMsg = response.error?.message || response.message || 'Unknown error';
                return {
                    llmContent: `Error listing codemaps: ${errorMsg}`,
                    returnDisplay: `Error listing codemaps: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            if (!response.data?.codemaps) {
                return {
                    llmContent: 'No codemaps found or empty response received.',
                    returnDisplay: 'No codemaps found',
                };
            }

            const codemapList = response.data.codemaps.map((codemap) => ({
                id: codemap.id,
                title: codemap.title,
                description: codemap.description,
                status: codemap.status,
                createdAt: codemap.createdAt,
                updatedAt: codemap.updatedAt,
            }));

            const llmContent = JSON.stringify({
                count: response.data.count,
                codemaps: codemapList,
            }, null, 2);

            return {
                llmContent,
                returnDisplay: `Found ${response.data.count} codemap(s)`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error listing codemaps: ${errorMessage}`,
                returnDisplay: `Error listing codemaps: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the CodemapList tool
 */
export class CodemapListTool extends BaseDeclarativeTool<
    CodemapListToolParams,
    ToolResult
> {
    static readonly Name: string = 'codemap_list';

    constructor() {
        super(
            CodemapListTool.Name,
            'CodemapList',
            'Lists all codemaps for a project. Returns an array of codemap metadata including id, title, description, status, and timestamps.',
            Kind.Read,
            {
                properties: {
                    project_path: {
                        description:
                            'Optional project path to list codemaps for. If not provided, uses the current project.',
                        type: 'string',
                    },
                },
                required: [],
                type: 'object',
            },
        );
    }

    protected createInvocation(
        params: CodemapListToolParams,
    ): ToolInvocation<CodemapListToolParams, ToolResult> {
        return new CodemapListToolInvocation(params);
    }
}
