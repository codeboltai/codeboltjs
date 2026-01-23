/**
 * Project Structure Add Route Tool - Adds an API route to a package
 * Wraps the SDK's projectStructure.addRoute() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import projectStructureService from '../../modules/projectStructure';

/**
 * Parameters for the AddRoute tool
 */
export interface AddRouteToolParams {
    /** ID of the package to add the route to */
    packageId: string;
    /** Path of the API route */
    path: string;
    /** HTTP method */
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
    /** Optional description */
    description?: string;
    /** Optional handler name */
    handler?: string;
    /** Optional file path */
    file?: string;
    /** Optional auth requirement */
    auth?: boolean;
    /** Optional tags */
    tags?: string[];
    /** Optional workspace path */
    workspacePath?: string;
}

class AddRouteToolInvocation extends BaseToolInvocation<
    AddRouteToolParams,
    ToolResult
> {
    constructor(params: AddRouteToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const { packageId, workspacePath, ...route } = this.params;
            const response = await projectStructureService.addRoute(
                packageId,
                route,
                workspacePath
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully added route: ${this.params.method} ${this.params.path}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error adding route: ${errorMessage}`,
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
 * Tool to add an API route to a package
 */
export class AddRouteTool extends BaseDeclarativeTool<
    AddRouteToolParams,
    ToolResult
> {
    static readonly Name: string = 'project_structure_add_route';

    constructor() {
        super(
            AddRouteTool.Name,
            'AddRoute',
            'Adds an API route to a package with path, method, and optional metadata.',
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
                        description: 'Path of the API route',
                    },
                    method: {
                        type: 'string',
                        enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
                        description: 'HTTP method for the route',
                    },
                    description: {
                        type: 'string',
                        description: 'Description of the route',
                    },
                    handler: {
                        type: 'string',
                        description: 'Handler function name',
                    },
                    file: {
                        type: 'string',
                        description: 'File path containing the handler',
                    },
                    auth: {
                        type: 'boolean',
                        description: 'Whether authentication is required',
                    },
                    tags: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Tags for the route',
                    },
                    workspacePath: {
                        type: 'string',
                        description: 'Optional workspace path',
                    },
                },
                required: ['packageId', 'path', 'method'],
            },
        );
    }

    protected createInvocation(
        params: AddRouteToolParams,
    ): ToolInvocation<AddRouteToolParams, ToolResult> {
        return new AddRouteToolInvocation(params);
    }
}
