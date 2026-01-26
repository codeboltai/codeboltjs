/**
 * Project Structure Update UI Route Tool - Updates a UI route
 * Wraps the SDK's projectStructure.updateUiRoute() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import projectStructureService from '../../modules/projectStructure';

/**
 * Parameters for the UpdateUiRoute tool
 */
export interface UpdateUiRouteToolParams {
    /** ID of the package containing the route */
    packageId: string;
    /** ID of the route to update */
    routeId: string;
    /** Optional new path */
    path?: string;
    /** Optional new component name */
    component?: string;
    /** Optional new file path */
    file?: string;
    /** Optional new description */
    description?: string;
    /** Optional new auth requirement */
    auth?: boolean;
    /** Optional new layout name */
    layout?: string;
    /** Optional workspace path */
    workspacePath?: string;
}

class UpdateUiRouteToolInvocation extends BaseToolInvocation<
    UpdateUiRouteToolParams,
    ToolResult
> {
    constructor(params: UpdateUiRouteToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const { packageId, routeId, workspacePath, ...updates } = this.params;
            const response = await projectStructureService.updateUiRoute(
                packageId,
                routeId,
                updates,
                workspacePath
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully updated UI route: ${routeId}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error updating UI route: ${errorMessage}`,
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
 * Tool to update a UI route
 */
export class UpdateUiRouteTool extends BaseDeclarativeTool<
    UpdateUiRouteToolParams,
    ToolResult
> {
    static readonly Name: string = 'project_structure_update_ui_route';

    constructor() {
        super(
            UpdateUiRouteTool.Name,
            'UpdateUiRoute',
            'Updates an existing UI route with new path, component, or other properties.',
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
                    component: {
                        type: 'string',
                        description: 'New component name',
                    },
                    file: {
                        type: 'string',
                        description: 'New file path',
                    },
                    description: {
                        type: 'string',
                        description: 'New description',
                    },
                    auth: {
                        type: 'boolean',
                        description: 'New authentication requirement',
                    },
                    layout: {
                        type: 'string',
                        description: 'New layout name',
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
        params: UpdateUiRouteToolParams,
    ): ToolInvocation<UpdateUiRouteToolParams, ToolResult> {
        return new UpdateUiRouteToolInvocation(params);
    }
}
