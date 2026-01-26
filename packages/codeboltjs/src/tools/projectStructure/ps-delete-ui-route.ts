/**
 * Project Structure Delete UI Route Tool - Deletes a UI route
 * Wraps the SDK's projectStructure.deleteUiRoute() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import projectStructureService from '../../modules/projectStructure';

/**
 * Parameters for the DeleteUiRoute tool
 */
export interface DeleteUiRouteToolParams {
    /** ID of the package containing the route */
    packageId: string;
    /** ID of the route to delete */
    routeId: string;
    /** Optional workspace path */
    workspacePath?: string;
}

class DeleteUiRouteToolInvocation extends BaseToolInvocation<
    DeleteUiRouteToolParams,
    ToolResult
> {
    constructor(params: DeleteUiRouteToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await projectStructureService.deleteUiRoute(
                this.params.packageId,
                this.params.routeId,
                this.params.workspacePath
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully deleted UI route: ${this.params.routeId}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error deleting UI route: ${errorMessage}`,
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
 * Tool to delete a UI route
 */
export class DeleteUiRouteTool extends BaseDeclarativeTool<
    DeleteUiRouteToolParams,
    ToolResult
> {
    static readonly Name: string = 'project_structure_delete_ui_route';

    constructor() {
        super(
            DeleteUiRouteTool.Name,
            'DeleteUiRoute',
            'Deletes a UI route from a package by its ID.',
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
        params: DeleteUiRouteToolParams,
    ): ToolInvocation<DeleteUiRouteToolParams, ToolResult> {
        return new DeleteUiRouteToolInvocation(params);
    }
}
