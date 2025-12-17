import cbws from '../core/websocket';
import { randomUUID } from 'crypto';

/**
 * RequirementPlan Types
 */
export type SectionType = 'markdown' | 'specs-link' | 'actionplan-link' | 'uiflow-link' | 'code-block';

export interface RequirementPlanSection {
    id: string;
    type: SectionType;
    title?: string;
    content?: string;
    linkedFile?: string;
    order?: number;
}

export interface RequirementPlanDocument {
    version: string;
    title: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    sections: RequirementPlanSection[];
}

export interface CreatePlanData {
    fileName: string;
}

export interface UpdatePlanData {
    filePath: string;
    content: string | RequirementPlanDocument;
}

export interface AddSectionData {
    filePath: string;
    section: Omit<RequirementPlanSection, 'id' | 'order'>;
    afterIndex?: number;
}

export interface UpdateSectionData {
    filePath: string;
    sectionId: string;
    updates: Partial<RequirementPlanSection>;
}

export interface RemoveSectionData {
    filePath: string;
    sectionId: string;
}

export interface ReorderSectionsData {
    filePath: string;
    sectionIds: string[];
}

/**
 * Response Types
 */
export interface RequirementPlanCreateResponse {
    type: 'requirementPlanCreateResponse';
    success: boolean;
    filePath?: string;
    error?: string;
    requestId?: string;
}

export interface RequirementPlanGetResponse {
    type: 'requirementPlanGetResponse';
    success: boolean;
    data?: RequirementPlanDocument;
    filePath?: string;
    error?: string;
    requestId?: string;
}

export interface RequirementPlanUpdateResponse {
    type: 'requirementPlanUpdateResponse';
    success: boolean;
    filePath?: string;
    error?: string;
    requestId?: string;
}

export interface RequirementPlanListResponse {
    type: 'requirementPlanListResponse';
    success: boolean;
    plans?: Array<{ fileName: string; filePath: string }>;
    error?: string;
    requestId?: string;
}

export interface RequirementPlanSectionResponse {
    type: string;
    success: boolean;
    document?: RequirementPlanDocument;
    error?: string;
    requestId?: string;
}

/**
 * RequirementPlan Module
 * Provides functionality for managing Requirement Plan documents
 */
const requirementPlanService = {
    /**
     * Create a new requirement plan file
     * @param fileName - Name for the new plan file (without .plan extension)
     * @returns Promise resolving to creation result with file path
     */
    create: (fileName: string): Promise<RequirementPlanCreateResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'requirementPlanEvent',
                action: 'requirementPlan:create',
                requestId,
                message: { fileName }
            },
            'requirementPlanCreateResponse'
        );
    },

    /**
     * Get a requirement plan by file path
     * @param filePath - Path to the plan file
     * @returns Promise resolving to the plan document
     */
    get: (filePath: string): Promise<RequirementPlanGetResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'requirementPlanEvent',
                action: 'requirementPlan:get',
                requestId,
                message: { filePath }
            },
            'requirementPlanGetResponse'
        );
    },

    /**
     * Update a requirement plan
     * @param filePath - Path to the plan file
     * @param content - New content (string or RequirementPlanDocument)
     * @returns Promise resolving to update result
     */
    update: (filePath: string, content: string | RequirementPlanDocument): Promise<RequirementPlanUpdateResponse> => {
        const requestId = randomUUID();
        const contentStr = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'requirementPlanEvent',
                action: 'requirementPlan:update',
                requestId,
                message: { filePath, content: contentStr }
            },
            'requirementPlanUpdateResponse'
        );
    },

    /**
     * List all requirement plans in the project
     * @returns Promise resolving to list of plans
     */
    list: (): Promise<RequirementPlanListResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'requirementPlanEvent',
                action: 'requirementPlan:list',
                requestId,
                message: {}
            },
            'requirementPlanListResponse'
        );
    },

    /**
     * Add a section to a requirement plan
     * @param filePath - Path to the plan file
     * @param section - Section data to add
     * @param afterIndex - Optional index to insert after (-1 for beginning)
     * @returns Promise resolving to updated document
     */
    addSection: (
        filePath: string,
        section: Omit<RequirementPlanSection, 'id' | 'order'>,
        afterIndex?: number
    ): Promise<RequirementPlanSectionResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'requirementPlanEvent',
                action: 'requirementPlan:section:add',
                requestId,
                message: { filePath, section, afterIndex }
            },
            'requirementPlanSectionAddResponse'
        );
    },

    /**
     * Update a section in a requirement plan
     * @param filePath - Path to the plan file
     * @param sectionId - ID of the section to update
     * @param updates - Partial section data to update
     * @returns Promise resolving to updated document
     */
    updateSection: (
        filePath: string,
        sectionId: string,
        updates: Partial<RequirementPlanSection>
    ): Promise<RequirementPlanSectionResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'requirementPlanEvent',
                action: 'requirementPlan:section:update',
                requestId,
                message: { filePath, sectionId, updates }
            },
            'requirementPlanSectionUpdateResponse'
        );
    },

    /**
     * Remove a section from a requirement plan
     * @param filePath - Path to the plan file
     * @param sectionId - ID of the section to remove
     * @returns Promise resolving to updated document
     */
    removeSection: (filePath: string, sectionId: string): Promise<RequirementPlanSectionResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'requirementPlanEvent',
                action: 'requirementPlan:section:remove',
                requestId,
                message: { filePath, sectionId }
            },
            'requirementPlanSectionRemoveResponse'
        );
    },

    /**
     * Reorder sections in a requirement plan
     * @param filePath - Path to the plan file
     * @param sectionIds - Array of section IDs in new order
     * @returns Promise resolving to updated document
     */
    reorderSections: (filePath: string, sectionIds: string[]): Promise<RequirementPlanSectionResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'requirementPlanEvent',
                action: 'requirementPlan:section:reorder',
                requestId,
                message: { filePath, sectionIds }
            },
            'requirementPlanSectionReorderResponse'
        );
    }
};

export default requirementPlanService;
