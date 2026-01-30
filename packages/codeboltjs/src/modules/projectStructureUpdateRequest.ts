import cbws from '../core/websocket';
import { randomUUID } from 'crypto';
import type {
    CreateUpdateRequestData,
    UpdateUpdateRequestData,
    CreateDisputeData,
    AddCommentData,
    AddWatcherData,
    UpdateRequestFilters,
    UpdateRequestResponse,
    UpdateRequestListResponse
} from '@codebolt/types/lib';

/**
 * Project Structure Update Request Module for codeboltjs
 * Allows agents to propose changes to the project structure
 */
const codeboltProjectStructureUpdateRequest = {
    /**
     * Create a new update request
     */
    create: async (data: CreateUpdateRequestData, workspacePath?: string): Promise<UpdateRequestResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'updateRequest.create',
                action: 'create', // Used by CLI service to route
                requestId,
                params: { ...data, workspacePath }
            },
            'updateRequestCreateResponse'
        );
    },

    /**
     * Get an update request by ID
     */
    get: async (id: string, workspacePath?: string): Promise<UpdateRequestResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'updateRequest.get',
                action: 'get',
                requestId,
                params: { id, workspacePath }
            },
            'updateRequestGetResponse'
        );
    },

    /**
     * List update requests
     */
    list: async (filters?: UpdateRequestFilters, workspacePath?: string): Promise<UpdateRequestListResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'updateRequest.list',
                action: 'list',
                requestId,
                params: { ...filters, workspacePath }
            },
            'updateRequestListResponse'
        );
    },

    /**
     * Update an existing update request
     */
    update: async (id: string, updates: UpdateUpdateRequestData, workspacePath?: string): Promise<UpdateRequestResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'updateRequest.update',
                action: 'update',
                requestId,
                params: { id, ...updates, workspacePath }
            },
            'updateRequestUpdateResponse'
        );
    },

    /**
     * Delete an update request
     */
    delete: async (id: string, workspacePath?: string): Promise<UpdateRequestResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'updateRequest.delete',
                action: 'delete',
                requestId,
                params: { id, workspacePath }
            },
            'updateRequestDeleteResponse'
        );
    },

    /**
     * Submit an update request for review
     */
    submit: async (id: string, workspacePath?: string): Promise<UpdateRequestResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'updateRequest.submit',
                action: 'submit',
                requestId,
                params: { id, workspacePath }
            },
            'updateRequestSubmitResponse'
        );
    },

    /**
     * Start working on an update request
     */
    startWork: async (id: string, workspacePath?: string): Promise<UpdateRequestResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'updateRequest.startWork',
                action: 'startWork',
                requestId,
                params: { id, workspacePath }
            },
            'updateRequestStartWorkResponse'
        );
    },

    /**
     * Complete work on an update request
     */
    complete: async (id: string, workspacePath?: string): Promise<UpdateRequestResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'updateRequest.complete',
                action: 'complete',
                requestId,
                params: { id, workspacePath }
            },
            'updateRequestCompleteResponse'
        );
    },

    /**
     * Merge an update request
     */
    merge: async (id: string, workspacePath?: string): Promise<UpdateRequestResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'updateRequest.merge',
                action: 'merge',
                requestId,
                params: { id, workspacePath }
            },
            'updateRequestMergeResponse'
        );
    },

    /**
     * Add a dispute
     */
    addDispute: async (id: string, data: CreateDisputeData, workspacePath?: string): Promise<UpdateRequestResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'updateRequest.dispute',
                action: 'dispute',
                requestId,
                params: { id, ...data, workspacePath }
            },
            'updateRequestDisputeResponse'
        );
    },

    /**
     * Resolve a dispute
     */
    resolveDispute: async (id: string, disputeId: string, resolutionSummary?: string, workspacePath?: string): Promise<UpdateRequestResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'updateRequest.resolveDispute',
                action: 'resolveDispute',
                requestId,
                params: { id, disputeId, resolutionSummary, workspacePath }
            },
            'updateRequestResolveDisputeResponse'
        );
    },

    /**
     * Add a comment
     */
    addComment: async (id: string, disputeId: string, data: AddCommentData, workspacePath?: string): Promise<UpdateRequestResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'updateRequest.comment',
                action: 'comment',
                requestId,
                params: { id, disputeId, ...data, workspacePath }
            },
            'updateRequestCommentResponse'
        );
    },

    /**
     * Watch an update request
     */
    watch: async (id: string, data: AddWatcherData, workspacePath?: string): Promise<UpdateRequestResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'updateRequest.watch',
                action: 'watch',
                requestId,
                params: { id, ...data, workspacePath }
            },
            'updateRequestWatchResponse'
        );
    },

    /**
     * Stop watching an update request
     */
    unwatch: async (id: string, watcherId: string, workspacePath?: string): Promise<UpdateRequestResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'updateRequest.unwatch',
                action: 'unwatch',
                requestId,
                params: { id, watcherId, workspacePath }
            },
            'updateRequestUnwatchResponse'
        );
    }
};

export default codeboltProjectStructureUpdateRequest;
