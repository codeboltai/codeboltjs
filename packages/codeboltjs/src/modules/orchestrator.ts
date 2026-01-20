
import { AgentResponseType, EventType } from '@codebolt/types/enum';
import cbws from '../core/websocket';
import { AgentAction } from '@codebolt/types/enum';

// Define types locally since we can't easily modify the types package
// These mirrors the server-side OrchestratorInstance interface
export interface OrchestratorInstance {
    id: string;
    name: string;
    description: string;
    agentId: string;
    defaultWorkerAgentId?: string | null;
    threadId: string;
    status: 'idle' | 'running' | 'paused';
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export interface OrchestratorResponse {
    success: boolean;
    requestId?: string;
    data?: any;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
}

export interface CreateOrchestratorParams {
    name: string;
    description: string;
    agentId: string;
    defaultWorkerAgentId?: string;
    metadata?: Record<string, any>;
}

export interface UpdateOrchestratorParams {
    name?: string;
    description?: string;
    agentId?: string;
    defaultWorkerAgentId?: string;
    metadata?: Record<string, any>;
}

export interface UpdateOrchestratorSettingsParams {
    name?: string;
    description?: string;
    defaultWorkerAgentId?: string;
    metadata?: Record<string, any>;
}

// We use a custom event type string for orchestrator events since we can't add to the enum 
// The server parses 'orchestrator.<action>' type strings
const ORCHESTRATOR_EVENT_PREFIX = 'orchestrator.';

const orchestrator = {
    /**
     * Lists all orchestrators
     */
    listOrchestrators: (): Promise<OrchestratorResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: `${ORCHESTRATOR_EVENT_PREFIX}list` as any,
            },
            // We expect a generic response type since we don't have specific enum for it
            'orchestratorResponse' as any
        );
    },

    /**
     * Gets a specific orchestrator by ID
     */
    getOrchestrator: (orchestratorId: string): Promise<OrchestratorResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: `${ORCHESTRATOR_EVENT_PREFIX}get` as any,
                orchestratorId
            },
            'orchestratorResponse' as any
        );
    },

    /**
     * Gets orchestrator settings
     */
    getOrchestratorSettings: (orchestratorId: string): Promise<OrchestratorResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: `${ORCHESTRATOR_EVENT_PREFIX}getSettings` as any,
                orchestratorId
            },
            'orchestratorResponse' as any
        );
    },

    /**
     * Creates a new orchestrator
     */
    createOrchestrator: (data: CreateOrchestratorParams): Promise<OrchestratorResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: `${ORCHESTRATOR_EVENT_PREFIX}create` as any,
                data
            },
            'orchestratorResponse' as any
        );
    },

    /**
     * Updates an orchestrator
     */
    updateOrchestrator: (orchestratorId: string, data: UpdateOrchestratorParams): Promise<OrchestratorResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: `${ORCHESTRATOR_EVENT_PREFIX}update` as any,
                orchestratorId,
                data
            },
            'orchestratorResponse' as any
        );
    },

    /**
     * Updates orchestrator settings
     */
    updateOrchestratorSettings: (orchestratorId: string, settings: UpdateOrchestratorSettingsParams): Promise<OrchestratorResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: `${ORCHESTRATOR_EVENT_PREFIX}updateSettings` as any,
                orchestratorId,
                settings
            },
            'orchestratorResponse' as any
        );
    },

    /**
     * Deletes an orchestrator
     */
    deleteOrchestrator: (orchestratorId: string): Promise<OrchestratorResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: `${ORCHESTRATOR_EVENT_PREFIX}delete` as any,
                orchestratorId
            },
            'orchestratorResponse' as any
        );
    },

    /**
     * Updates orchestrator status
     */
    updateOrchestratorStatus: (orchestratorId: string, status: 'idle' | 'running' | 'paused'): Promise<OrchestratorResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: `${ORCHESTRATOR_EVENT_PREFIX}updateStatus` as any,
                orchestratorId,
                status
            },
            'orchestratorResponse' as any
        );
    },

    /**
     * Initiates a Codebolt JS update
     */
    updateCodeboltJs: (): Promise<OrchestratorResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: `${ORCHESTRATOR_EVENT_PREFIX}updateCodeboltJs` as any,
            },
            'orchestratorResponse' as any
        );
    }
};

export default orchestrator;
