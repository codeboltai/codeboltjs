/**
 * Project Structure Update Route Tool - Updates an API route
 * Wraps the SDK's projectStructure.updateRoute() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import projectStructureService from '../../modules/projectStructure';

/**
 * Parameters for the UpdateRoute tool
 */
export interface UpdateRouteToolParams {
    /** ID of the package containing the route */
    packageId: string;
    /** ID of the route to update */
    routeId: string;
    /** Optional new path */
    path?: string;
    /** Optional new HTTP method */
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
    /** Optional new description */
    description?: string;
    /** Optional new handler name */
    handler?: string;
    /** Optional new file path */
    file?: string;
    /** Optional new auth requirement */
    auth?: boolean;
    /** Optional new tags */
    tags?: string[];
    /** Optional workspace path */
    workspacePath?: string;
}

class UpdateRouteToolInvocation extends BaseToolInvocation<
    UpdateRouteToolParams,
    ToolResult
> {
    constructor(params: UpdateRouteToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const { packageId, routeId, workspacePath, ...updates } = this.params;
            const response = await projectStructureService.updateRoute(
                packageId,
                routeId,
                updates,
                workspacePath
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully updated route: ${routeId}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error updating route: ${errorMessage}`,
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
 * Tool to update an API route
 */
export class UpdateRouteTool extends BaseDeclarativeTool<
    UpdateRouteToolParams,
    ToolResult
> {
    static readonly Name: string = 'project_structure_update_route';

    constructor() {
        super(
            UpdateRouteTool.Name,
            'UpdateRoute',
            'Updates an existing API route with new path, method, or other properties.',
            Kind.Edit,
            {
                type: 'object',
                properties: {
                    packageId: {
                        type: 'string',
                        description: 'ID of the package containing the route',
                    },
                    routeId: {
                        type: 'string',
                        description: 'ID of the route to update',
                    },
                    path: {
                        type: 'string',
                        description: 'New path for the route',
                    },
                    method: {
                        type: 'string',
                        enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
                        description: 'New HTTP method',
                    },
                    description: {
                        type: 'string',
                        description: 'New description',
                    },
                    handler: {
                        type: 'string',
                        description: 'New handler function name',
                    },
                    file: {
                        type: 'string',
                        description: 'New file path',
                    },
                    auth: {
                        type: 'boolean',
                        description: 'New authentication requirement',
                    },
                    tags: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'New tags',
                    },
                    workspacePath: {
                        type: 'string',
                        description: 'Optional workspace path',
                    },
                },
                required: ['packageId', 'routeId'],
            },
        );
    }

    protected createInvocation(
        params: UpdateRouteToolParams,
    ): ToolInvocation<UpdateRouteToolParams, ToolResult> {
        return new UpdateRouteToolInvocation(params);
    }
}
