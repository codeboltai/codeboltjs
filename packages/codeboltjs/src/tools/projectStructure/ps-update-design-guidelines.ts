/**
 * Project Structure Update Design Guidelines Tool - Updates design guidelines for a package
 * Wraps the SDK's projectStructure.updateDesignGuidelines() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import projectStructureService from '../../modules/projectStructure';

/**
 * Parameters for the UpdateDesignGuidelines tool
 */
export interface UpdateDesignGuidelinesToolParams {
    /** ID of the package to update */
    packageId: string;
    /** Optional color palette */
    colors?: Record<string, string>;
    /** Optional fonts list */
    fonts?: string[];
    /** Optional spacing definitions */
    spacing?: Record<string, string>;
    /** Optional component list */
    components?: string[];
    /** Optional custom guidelines text */
    customGuidelines?: string;
    /** Optional workspace path */
    workspacePath?: string;
}

class UpdateDesignGuidelinesToolInvocation extends BaseToolInvocation<
    UpdateDesignGuidelinesToolParams,
    ToolResult
> {
    constructor(params: UpdateDesignGuidelinesToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const { packageId, workspacePath, ...guidelines } = this.params;
            const response = await projectStructureService.updateDesignGuidelines(
                packageId,
                guidelines,
                workspacePath
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully updated design guidelines for package: ${packageId}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error updating design guidelines: ${errorMessage}`,
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
 * Tool to update design guidelines for a package
 */
export class UpdateDesignGuidelinesTool extends BaseDeclarativeTool<
    UpdateDesignGuidelinesToolParams,
    ToolResult
> {
    static readonly Name: string = 'project_structure_update_design_guidelines';

    constructor() {
        super(
            UpdateDesignGuidelinesTool.Name,
            'UpdateDesignGuidelines',
            'Updates design guidelines for a package including colors, fonts, spacing, and components.',
            Kind.Edit,
            {
                type: 'object',
                properties: {
                    packageId: {
                        type: 'string',
                        description: 'ID of the package to update',
                    },
                    colors: {
                        type: 'object',
                        description: 'Color palette as key-value pairs',
                    },
                    fonts: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'List of fonts',
                    },
                    spacing: {
                        type: 'object',
                        description: 'Spacing definitions as key-value pairs',
                    },
                    components: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'List of component names',
                    },
                    customGuidelines: {
                        type: 'string',
                        description: 'Custom guidelines text',
                    },
                    workspacePath: {
                        type: 'string',
                        description: 'Optional workspace path',
                    },
                },
                required: ['packageId'],
            },
        );
    }

    protected createInvocation(
        params: UpdateDesignGuidelinesToolParams,
    ): ToolInvocation<UpdateDesignGuidelinesToolParams, ToolResult> {
        return new UpdateDesignGuidelinesToolInvocation(params);
    }
}
