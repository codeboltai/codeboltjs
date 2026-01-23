/**
 * Project Structure Delete Route Tool - Deletes an API route
 * Wraps the SDK's projectStructure.deleteRoute() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import projectStructureService from '../../modules/projectStructure';

/**
 * Parameters for the DeleteRoute tool
 */
export interface DeleteRouteToolParams {
    /** ID of the package containing the route */
    packageId: string;
    /** ID of the route to delete */
    routeId: string;
    /** Optional workspace path */
    workspacePath?: string;
}

class DeleteRouteToolInvocation extends BaseToolInvocation<
    DeleteRouteToolParams,
    ToolResult
> {
    constructor(params: DeleteRouteToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await projectStructureService.deleteRoute(
                this.params.packageId,
                this.params.routeId,
                this.params.workspacePath
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully deleted route: ${this.params.routeId}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error deleting route: ${errorMessage}`,
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
 * Tool to delete an API route
 */
export class DeleteRouteTool extends BaseDeclarativeTool<
    DeleteRouteToolParams,
    ToolResult
> {
    static readonly Name: string = 'project_structure_delete_route';

    constructor() {
        super(
            DeleteRouteTool.Name,
            'DeleteRoute',
            'Deletes an API route from a package by its ID.',
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
                        description: 'ID of the route to delete',
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
        params: DeleteRouteToolParams,
    ): ToolInvocation<DeleteRouteToolParams, ToolResult> {
        return new DeleteRouteToolInvocation(params);
    }
}
