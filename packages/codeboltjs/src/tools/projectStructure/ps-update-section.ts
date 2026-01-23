/**
 * Project Structure Update Section Tool - Updates a specific section of a package
 * Wraps the SDK's projectStructure.updateSection() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import projectStructureService from '../../modules/projectStructure';

/**
 * Parameters for the UpdateSection tool
 */
export interface UpdateSectionToolParams {
    /** ID of the package to update */
    packageId: string;
    /** Name of the section to update */
    section: string;
    /** Data to set for the section */
    sectionData: any;
    /** Optional workspace path */
    workspacePath?: string;
}

class UpdateSectionToolInvocation extends BaseToolInvocation<
    UpdateSectionToolParams,
    ToolResult
> {
    constructor(params: UpdateSectionToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await projectStructureService.updateSection(
                this.params.packageId,
                this.params.section,
                this.params.sectionData,
                this.params.workspacePath
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully updated section '${this.params.section}' for package: ${this.params.packageId}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error updating section: ${errorMessage}`,
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
 * Tool to update a specific section of a package
 */
export class UpdateSectionTool extends BaseDeclarativeTool<
    UpdateSectionToolParams,
    ToolResult
> {
    static readonly Name: string = 'project_structure_update_section';

    constructor() {
        super(
            UpdateSectionTool.Name,
            'UpdateSection',
            'Updates a specific section of a package with custom data.',
            Kind.Edit,
            {
                type: 'object',
                properties: {
                    packageId: {
                        type: 'string',
                        description: 'ID of the package to update',
                    },
                    section: {
                        type: 'string',
                        description: 'Name of the section to update',
                    },
                    sectionData: {
                        description: 'Data to set for the section (can be any type)',
                    },
                    workspacePath: {
                        type: 'string',
                        description: 'Optional workspace path',
                    },
                },
                required: ['packageId', 'section', 'sectionData'],
            },
        );
    }

    protected createInvocation(
        params: UpdateSectionToolParams,
    ): ToolInvocation<UpdateSectionToolParams, ToolResult> {
        return new UpdateSectionToolInvocation(params);
    }
}
