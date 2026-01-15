import cbws from '../core/websocket';
import type {
    CapabilityType,
    CapabilityInput,
    CapabilityOutput,
    CapabilityMetadata,
    Capability,
    CapabilityFilter,
    CapabilityExecutor,
    CapabilityExecutionMetadata,
    ListCapabilitiesResponse,
    GetCapabilityDetailResponse,
    ListExecutorsResponse,
    StartCapabilityResponse,
    StopCapabilityResponse,
    GetExecutionStatusResponse
} from '@codebolt/types/sdk';

// Re-export types for convenience
export type {
    CapabilityType,
    CapabilityInput,
    CapabilityOutput,
    CapabilityMetadata,
    Capability,
    CapabilityFilter,
    CapabilityExecutor,
    CapabilityExecutionMetadata,
    ListCapabilitiesResponse,
    GetCapabilityDetailResponse,
    ListExecutorsResponse,
    StartCapabilityResponse,
    StopCapabilityResponse,
    GetExecutionStatusResponse
} from '@codebolt/types/sdk';

/**
 * Capability Module
 * Provides functionality for managing and executing capabilities (Skills, Powers, Talents)
 * 
 * Implements Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */

const codeboltCapability = {
    /**
     * List all available capabilities with optional filtering
     * @param filter - Optional filter criteria (type, tags, author)
     * @returns Promise resolving to list of capabilities
     * 
     * Requirements: 9.1
     */
    listCapabilities: (filter?: CapabilityFilter): Promise<ListCapabilitiesResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'capability',
                action: 'listCapabilities',
                filter
            },
            'listCapabilitiesResponse'
        );
    },

    /**
     * List capabilities by type
     * @param capabilityType - Type of capabilities to list (skill, power, talent, etc.)
     * @returns Promise resolving to list of capabilities of the specified type
     * 
     * Requirements: 9.1
     */
    listCapabilitiesByType: (capabilityType: CapabilityType): Promise<ListCapabilitiesResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'capability',
                action: 'listCapabilities',
                filter: { type: capabilityType }
            },
            'listCapabilitiesResponse'
        );
    },

    /**
     * List all available skills
     * @returns Promise resolving to list of skills
     * 
     * Requirements: 9.1
     */
    listSkills: (): Promise<ListCapabilitiesResponse> => {
        return codeboltCapability.listCapabilitiesByType('skill');
    },

    /**
     * List all available powers
     * @returns Promise resolving to list of powers
     * 
     * Requirements: 9.1
     */
    listPowers: (): Promise<ListCapabilitiesResponse> => {
        return codeboltCapability.listCapabilitiesByType('power');
    },

    /**
     * List all available talents
     * @returns Promise resolving to list of talents
     * 
     * Requirements: 9.1
     */
    listTalents: (): Promise<ListCapabilitiesResponse> => {
        return codeboltCapability.listCapabilitiesByType('talent');
    },

    /**
     * Get detailed information about a specific capability
     * @param capabilityName - Name of the capability
     * @param capabilityType - Optional type to narrow search
     * @returns Promise resolving to capability details
     * 
     * Requirements: 9.2
     */
    getCapabilityDetail: (
        capabilityName: string,
        capabilityType?: CapabilityType
    ): Promise<GetCapabilityDetailResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'capability',
                action: 'getCapabilityDetail',
                capabilityName,
                capabilityType
            },
            'getCapabilityDetailResponse'
        );
    },

    /**
     * List all available capability executors
     * @returns Promise resolving to list of executors
     * 
     * Requirements: 9.3
     */
    listExecutors: (): Promise<ListExecutorsResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'capability',
                action: 'listExecutors'
            },
            'listExecutorsResponse'
        );
    },

    /**
     * Start a capability execution
     * @param capabilityName - Name of the capability to execute
     * @param capabilityType - Type of the capability (skill, power, talent, etc.)
     * @param params - Optional parameters to pass to the capability
     * @param timeout - Optional execution timeout in milliseconds
     * @returns Promise resolving to execution ID
     * 
     * Requirements: 9.4
     */
    startCapability: (
        capabilityName: string,
        capabilityType: CapabilityType,
        params?: Record<string, any>,
        timeout?: number
    ): Promise<StartCapabilityResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'capability',
                action: 'startCapability',
                capabilityName,
                capabilityType,
                params,
                timeout
            },
            'startCapabilityResponse'
        );
    },

    /**
     * Start a skill execution
     * @param skillName - Name of the skill to execute
     * @param params - Optional parameters to pass to the skill
     * @param timeout - Optional execution timeout in milliseconds
     * @returns Promise resolving to execution ID
     * 
     * Requirements: 9.4
     */
    startSkill: (
        skillName: string,
        params?: Record<string, any>,
        timeout?: number
    ): Promise<StartCapabilityResponse> => {
        return codeboltCapability.startCapability(skillName, 'skill', params, timeout);
    },

    /**
     * Start a power execution
     * @param powerName - Name of the power to execute
     * @param params - Optional parameters to pass to the power
     * @param timeout - Optional execution timeout in milliseconds
     * @returns Promise resolving to execution ID
     * 
     * Requirements: 9.4
     */
    startPower: (
        powerName: string,
        params?: Record<string, any>,
        timeout?: number
    ): Promise<StartCapabilityResponse> => {
        return codeboltCapability.startCapability(powerName, 'power', params, timeout);
    },

    /**
     * Start a talent execution
     * @param talentName - Name of the talent to execute
     * @param params - Optional parameters to pass to the talent
     * @param timeout - Optional execution timeout in milliseconds
     * @returns Promise resolving to execution ID
     * 
     * Requirements: 9.4
     */
    startTalent: (
        talentName: string,
        params?: Record<string, any>,
        timeout?: number
    ): Promise<StartCapabilityResponse> => {
        return codeboltCapability.startCapability(talentName, 'talent', params, timeout);
    },

    /**
     * Stop a running capability execution
     * @param executionId - ID of the execution to stop
     * @returns Promise resolving to success status
     * 
     * Requirements: 9.5
     */
    stopCapability: (executionId: string): Promise<StopCapabilityResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'capability',
                action: 'stopCapability',
                executionId
            },
            'stopCapabilityResponse'
        );
    },

    /**
     * Get the status of a capability execution
     * @param executionId - ID of the execution
     * @returns Promise resolving to execution status
     */
    getExecutionStatus: (executionId: string): Promise<GetExecutionStatusResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'capability',
                action: 'getExecutionStatus',
                executionId
            },
            'getExecutionStatusResponse'
        );
    },

    /**
     * Get capabilities by tag
     * @param tag - Tag to filter by
     * @returns Promise resolving to list of capabilities with the specified tag
     * 
     * Requirements: 9.1
     */
    getCapabilitiesByTag: (tag: string): Promise<ListCapabilitiesResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'capability',
                action: 'listCapabilities',
                filter: { tags: [tag] }
            },
            'listCapabilitiesResponse'
        );
    },

    /**
     * Get capabilities by author
     * @param author - Author to filter by
     * @returns Promise resolving to list of capabilities by the specified author
     * 
     * Requirements: 9.1
     */
    getCapabilitiesByAuthor: (author: string): Promise<ListCapabilitiesResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'capability',
                action: 'listCapabilities',
                filter: { author }
            },
            'listCapabilitiesResponse'
        );
    }
};

export default codeboltCapability;
