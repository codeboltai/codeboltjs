/**
 * Project Structure Add UI Route Tool - Adds a UI route to a package
 * Wraps the SDK's projectStructure.addUiRoute() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import projectStructureService from '../../modules/projectStructure';

/**
 * Parameters for the AddUiRoute tool
 */
export interface AddUiRouteToolParams {
    /** ID of the package to add the route to */
    packageId: string;
    /** Path of the UI route */
    path: string;
    /** Optional component name */
    component?: string;
    /** Optional file path */
    file?: string;
    /** Optional description */
    description?: string;
    /** Optional auth requirement */
    auth?: boolean;
    /** Optional layout name */
    layout?: string;
    /** Optional workspace path */
    workspacePath?: string;
}

class AddUiRouteToolInvocation extends BaseToolInvocation<
    AddUiRouteToolParams,
    ToolResult
> {
    constructor(params: AddUiRouteToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const { packageId, workspacePath, ...route } = this.params;
            const response = await projectStructureService.addUiRoute(
                packageId,
                route,
                workspacePath
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully added UI route: ${this.params.path}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error adding UI route: ${errorMessage}`,
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
 * Tool to add a UI route to a package
 */
export class AddUiRouteTool extends BaseDeclarativeTool<
    AddUiRouteToolParams,
    ToolResult
> {
    static readonly Name: string = 'project_structure_add_ui_route';

    constructor() {
        super(
            AddUiRouteTool.Name,
            'AddUiRoute',
            'Adds a UI route to a package with path, component, and optional metadata.',
            Kind.Edit,
            {
                type: 'object',
                properties: {
                    packageId: {
                        type: 'string',
                        description: 'ID of the package to add the route to',
                    },
                    path: {
                        type: 'string',
                        description: 'Path of the UI route',
                    },
                    component: {
                        type: 'string',
                        description: 'Component name for the route',
                    },
                    file: {
                        type: 'string',
                        description: 'File path containing the component',
                    },
                    description: {
                        type: 'string',
                        description: 'Description of the route',
                    },
                    auth: {
                        type: 'boolean',
                        description: 'Whether authentication is required',
                    },
                    layout: {
                        type: 'string',
                        description: 'Layout name to use',
                    },
                    workspacePath: {
                        type: 'string',
                        description: 'Optional workspace path',
                    },
                },
                required: ['packageId', 'path'],
            },
        );
    }

    protected createInvocation(
        params: AddUiRouteToolParams,
    ): ToolInvocation<AddUiRouteToolParams, ToolResult> {
        return new AddUiRouteToolInvocation(params);
    }
}
