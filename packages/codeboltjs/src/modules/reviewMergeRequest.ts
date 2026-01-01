import cbws from '../core/websocket';
import { randomUUID } from 'crypto';
import type {
    ReviewMergeRequest,
    CreateReviewMergeRequest,
    UpdateReviewMergeRequest,
    ReviewMergeRequestFilters,
    AddReviewFeedback,
    ReviewRequestStatus,
    MergeResult
} from '../types/reviewMergeRequest';

/**
 * Review Merge Request service client for codeboltjs.
 */
const reviewMergeRequestService = {

    /**
     * List review merge requests
     */
    list: async (filters: ReviewMergeRequestFilters = {}): Promise<{ requests: ReviewMergeRequest[], totalCount: number }> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'reviewMergeRequest.list',
                action: 'list',
                requestId,
                message: filters
            },
            'reviewMergeRequestListResponse'
        );
    },

    /**
     * Get a single review merge request
     */
    get: async (id: string): Promise<{ request: ReviewMergeRequest }> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'reviewMergeRequest.get',
                action: 'get',
                requestId,
                message: { id }
            },
            'reviewMergeRequestGetResponse'
        );
    },

    /**
     * Create a new review merge request
     */
    create: async (data: CreateReviewMergeRequest): Promise<{ request: ReviewMergeRequest }> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'reviewMergeRequest.create',
                action: 'create',
                requestId,
                message: data
            },
            'reviewMergeRequestCreateResponse'
        );
    },

    /**
     * Update an existing review merge request
     */
    update: async (id: string, data: UpdateReviewMergeRequest): Promise<{ request: ReviewMergeRequest }> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'reviewMergeRequest.update',
                action: 'update',
                requestId,
                message: { id, ...data }
            },
            'reviewMergeRequestUpdateResponse'
        );
    },

    /**
     * Delete a review merge request
     */
    delete: async (id: string): Promise<{ deleted: boolean }> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'reviewMergeRequest.delete',
                action: 'delete',
                requestId,
                message: { id }
            },
            'reviewMergeRequestDeleteResponse'
        );
    },

    /**
     * Add review feedback
     */
    addReview: async (id: string, feedback: AddReviewFeedback): Promise<{ request: ReviewMergeRequest }> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'reviewMergeRequest.addReview',
                action: 'addReview',
                requestId,
                message: { id, ...feedback }
            },
            'reviewMergeRequestAddReviewResponse'
        );
    },

    /**
     * Update status
     */
    updateStatus: async (id: string, status: ReviewRequestStatus): Promise<{ request: ReviewMergeRequest }> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'reviewMergeRequest.updateStatus',
                action: 'updateStatus',
                requestId,
                message: { id, status }
            },
            'reviewMergeRequestUpdateStatusResponse'
        );
    },

    /**
     * Merge request
     */
    merge: async (id: string, mergedBy: string): Promise<{ result: MergeResult }> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'reviewMergeRequest.merge',
                action: 'merge',
                requestId,
                message: { id, mergedBy }
            },
            'reviewMergeRequestMergeResponse'
        );
    },

    /**
     * Add linked job
     */
    addLinkedJob: async (id: string, jobId: string): Promise<{ request: ReviewMergeRequest }> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'reviewMergeRequest.addLinkedJob',
                action: 'addLinkedJob',
                requestId,
                message: { id, jobId }
            },
            'reviewMergeRequestAddLinkedJobResponse'
        );
    },

    /**
     * Remove linked job
     */
    removeLinkedJob: async (id: string, jobId: string): Promise<{ request: ReviewMergeRequest }> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'reviewMergeRequest.removeLinkedJob',
                action: 'removeLinkedJob',
                requestId,
                message: { id, jobId }
            },
            'reviewMergeRequestRemoveLinkedJobResponse'
        );
    },

    /**
     * Get pending reviews
     */
    pending: async (): Promise<{ requests: ReviewMergeRequest[], totalCount: number }> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'reviewMergeRequest.pending',
                action: 'pending',
                requestId,
                message: {}
            },
            'reviewMergeRequestPendingResponse'
        );
    },

    /**
     * Get ready to merge requests
     */
    readyToMerge: async (): Promise<{ requests: ReviewMergeRequest[], totalCount: number }> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'reviewMergeRequest.readyToMerge',
                action: 'readyToMerge',
                requestId,
                message: {}
            },
            'reviewMergeRequestReadyToMergeResponse'
        );
    },

    /**
     * Get requests by agent
     */
    byAgent: async (agentId: string): Promise<{ requests: ReviewMergeRequest[], totalCount: number }> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'reviewMergeRequest.byAgent',
                action: 'byAgent',
                requestId,
                message: { agentId }
            },
            'reviewMergeRequestByAgentResponse'
        );
    },

    /**
     * Get requests by swarm
     */
    bySwarm: async (swarmId: string): Promise<{ requests: ReviewMergeRequest[], totalCount: number }> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'reviewMergeRequest.bySwarm',
                action: 'bySwarm',
                requestId,
                message: { swarmId }
            },
            'reviewMergeRequestBySwarmResponse'
        );
    },

    /**
     * Get statistics
     */
    statistics: async (): Promise<{ statistics: any }> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'reviewMergeRequest.statistics',
                action: 'statistics',
                requestId,
                message: {}
            },
            'reviewMergeRequestStatisticsResponse'
        );
    }
};

export default reviewMergeRequestService;
