import cbws from '../core/websocket';
import { randomUUID } from 'crypto';
import type {
    CreateJobData,
    CreateJobGroupData,
    DependencyType,
    JobCreateResponse,
    JobDeleteBulkResponse,
    JobDeleteResponse,
    JobDependencyResponse,
    JobGroupCreateResponse,
    JobLabelsResponse,
    JobListFilters,
    JobListResponse,
    JobReadyBlockedResponse,
    JobShowResponse,
    JobUpdateResponse,
    UpdateJobData,
    // New types
    AddPheromoneTypeData,
    DepositPheromoneData,
    AddSplitProposalData,
    AddUnlockRequestData,
    AddBidData,
    AddBlockerData,
    JobPheromoneTypesResponse,
    JobPheromoneTypeResponse,
    JobPheromoneDepositResponse,
    JobPheromoneRemoveResponse,
    JobPheromoneListResponse,
    JobPheromoneAggregatedResponse,
    JobPheromoneSearchResponse,
    JobSplitProposeResponse,
    JobSplitDeleteResponse,
    JobSplitAcceptResponse,
    JobLockAcquireResponse,
    JobLockReleaseResponse,
    JobLockCheckResponse,
    JobUnlockRequestAddResponse,
    JobUnlockRequestApproveResponse,
    JobUnlockRequestRejectResponse,
    JobUnlockRequestDeleteResponse,
    JobBidAddResponse,
    JobBidWithdrawResponse,
    JobBidAcceptResponse,
    JobBidListResponse,
    JobBlockerAddResponse,
    JobBlockerRemoveResponse,
    JobBlockerResolveResponse
} from '../types/job';

/**
 * Job service client for codeboltjs.
 * Mirrors backend CLI job operations exposed via WebSocket (jobEvent).
 * Follows the same pattern as task.ts and todo.ts modules.
 */
const jobService = {
    // ================================
    // Job CRUD Operations
    // ================================

    createJob: async (groupId: string, data: CreateJobData): Promise<JobCreateResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'jobEvent',
                action: 'job:create',
                requestId,
                message: { groupId, data }
            },
            'jobCreateResponse'
        );
    },

    getJob: async (jobId: string): Promise<JobShowResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'jobEvent',
                action: 'job:show',
                requestId,
                message: { jobId }
            },
            'jobShowResponse'
        );
    },

    updateJob: async (jobId: string, data: UpdateJobData): Promise<JobUpdateResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'jobEvent',
                action: 'job:update',
                requestId,
                message: { jobId, data }
            },
            'jobUpdateResponse'
        );
    },

    deleteJob: async (jobId: string): Promise<JobDeleteResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'jobEvent',
                action: 'job:delete',
                requestId,
                message: { jobId }
            },
            'jobDeleteResponse'
        );
    },

    deleteJobs: async (jobIds: string[]): Promise<JobDeleteBulkResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'jobEvent',
                action: 'job:delete:bulk',
                requestId,
                message: { jobIds }
            },
            'jobDeleteBulkResponse'
        );
    },

    listJobs: async (filters: JobListFilters = {}): Promise<JobListResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'jobEvent',
                action: 'job:list',
                requestId,
                message: filters
            },
            'jobListResponse'
        );
    },

    // ================================
    // Job Group Operations
    // ================================

    createJobGroup: async (data: CreateJobGroupData): Promise<JobGroupCreateResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'jobEvent',
                action: 'job:group:create',
                requestId,
                message: data
            },
            'jobGroupCreateResponse'
        );
    },

    // ================================
    // Dependency Operations
    // ================================

    addDependency: async (jobId: string, targetId: string, type?: DependencyType): Promise<JobDependencyResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'jobEvent',
                action: 'job:dep:add',
                requestId,
                message: { jobId, targetId, type }
            },
            'jobDependencyAddResponse'
        );
    },

    removeDependency: async (jobId: string, targetId: string): Promise<JobDependencyResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'jobEvent',
                action: 'job:dep:remove',
                requestId,
                message: { jobId, targetId }
            },
            'jobDependencyRemoveResponse'
        );
    },

    // ================================
    // Ready/Blocked Operations
    // ================================

    getReadyJobs: async (filters: JobListFilters = {}): Promise<JobReadyBlockedResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'jobEvent',
                action: 'job:ready',
                requestId,
                message: filters
            },
            'jobReadyResponse'
        );
    },

    getBlockedJobs: async (filters: JobListFilters = {}): Promise<JobReadyBlockedResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'jobEvent',
                action: 'job:blocked',
                requestId,
                message: filters
            },
            'jobBlockedResponse'
        );
    },

    // ================================
    // Label Operations
    // ================================

    addLabel: async (label: string): Promise<JobLabelsResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'jobEvent',
                action: 'job:label:add',
                requestId,
                message: { label }
            },
            'jobLabelAddResponse'
        );
    },

    removeLabel: async (label: string): Promise<JobLabelsResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'jobEvent',
                action: 'job:label:remove',
                requestId,
                message: { label }
            },
            'jobLabelRemoveResponse'
        );
    },

    listLabels: async (): Promise<JobLabelsResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'jobEvent',
                action: 'job:labels:list',
                requestId,
                message: {}
            },
            'jobLabelsListResponse'
        );
    },

    // ================================
    // Pheromone Type Configuration
    // ================================

    getPheromoneTypes: async (): Promise<JobPheromoneTypesResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'jobEvent',
                action: 'job:pheromone-types:list',
                requestId,
                message: {}
            },
            'jobPheromoneTypesListResponse'
        );
    },

    addPheromoneType: async (data: AddPheromoneTypeData): Promise<JobPheromoneTypeResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'jobEvent',
                action: 'job:pheromone-type:add',
                requestId,
                message: data
            },
            'jobPheromoneTypeAddResponse'
        );
    },

    removePheromoneType: async (name: string): Promise<JobPheromoneTypeResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'jobEvent',
                action: 'job:pheromone-type:remove',
                requestId,
                message: { name }
            },
            'jobPheromoneTypeRemoveResponse'
        );
    },

    // ================================
    // Pheromone Operations on Jobs
    // ================================

    depositPheromone: async (jobId: string, deposit: DepositPheromoneData): Promise<JobPheromoneDepositResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'jobEvent',
                action: 'job:pheromone:deposit',
                requestId,
                message: { jobId, ...deposit }
            },
            'jobPheromoneDepositResponse'
        );
    },

    removePheromone: async (jobId: string, type: string, depositedBy?: string): Promise<JobPheromoneRemoveResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'jobEvent',
                action: 'job:pheromone:remove',
                requestId,
                message: { jobId, type, depositedBy }
            },
            'jobPheromoneRemoveResponse'
        );
    },

    getPheromones: async (jobId: string): Promise<JobPheromoneListResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'jobEvent',
                action: 'job:pheromone:list',
                requestId,
                message: { jobId }
            },
            'jobPheromoneListResponse'
        );
    },

    getPheromonesAggregated: async (jobId: string): Promise<JobPheromoneAggregatedResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'jobEvent',
                action: 'job:pheromone:aggregated',
                requestId,
                message: { jobId }
            },
            'jobPheromoneAggregatedResponse'
        );
    },

    listJobsByPheromone: async (type: string, minIntensity?: number): Promise<JobPheromoneSearchResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'jobEvent',
                action: 'job:pheromone:search',
                requestId,
                message: { type, minIntensity }
            },
            'jobPheromoneSearchResponse'
        );
    },

    getPheromonesWithDecay: async (jobId: string): Promise<JobPheromoneListResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'jobEvent',
                action: 'job:pheromone:with-decay',
                requestId,
                message: { jobId }
            },
            'jobPheromoneWithDecayResponse'
        );
    },

    getPheromonesAggregatedWithDecay: async (jobId: string): Promise<JobPheromoneAggregatedResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'jobEvent',
                action: 'job:pheromone:aggregated-with-decay',
                requestId,
                message: { jobId }
            },
            'jobPheromoneAggregatedWithDecayResponse'
        );
    },

    // ================================
    // Split Proposals
    // ================================

    addSplitProposal: async (jobId: string, proposal: AddSplitProposalData): Promise<JobSplitProposeResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'jobEvent',
                action: 'job:split:propose',
                requestId,
                message: { jobId, ...proposal }
            },
            'jobSplitProposeResponse'
        );
    },

    deleteSplitProposal: async (jobId: string, proposalId: string): Promise<JobSplitDeleteResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'jobEvent',
                action: 'job:split:delete',
                requestId,
                message: { jobId, proposalId }
            },
            'jobSplitDeleteResponse'
        );
    },

    acceptSplitProposal: async (jobId: string, proposalId: string): Promise<JobSplitAcceptResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'jobEvent',
                action: 'job:split:accept',
                requestId,
                message: { jobId, proposalId }
            },
            'jobSplitAcceptResponse'
        );
    },

    // ================================
    // Job Locking
    // ================================

    lockJob: async (jobId: string, agentId: string, agentName?: string): Promise<JobLockAcquireResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'jobEvent',
                action: 'job:lock:acquire',
                requestId,
                message: { jobId, agentId, agentName }
            },
            'jobLockAcquireResponse'
        );
    },

    unlockJob: async (jobId: string, agentId: string): Promise<JobLockReleaseResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'jobEvent',
                action: 'job:lock:release',
                requestId,
                message: { jobId, agentId }
            },
            'jobLockReleaseResponse'
        );
    },

    isJobLocked: async (jobId: string): Promise<JobLockCheckResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'jobEvent',
                action: 'job:lock:check',
                requestId,
                message: { jobId }
            },
            'jobLockCheckResponse'
        );
    },

    // ================================
    // Unlock Requests
    // ================================

    addUnlockRequest: async (jobId: string, request: AddUnlockRequestData): Promise<JobUnlockRequestAddResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'jobEvent',
                action: 'job:unlock-request:add',
                requestId,
                message: { jobId, ...request }
            },
            'jobUnlockRequestAddResponse'
        );
    },

    approveUnlockRequest: async (jobId: string, unlockRequestId: string, respondedBy: string): Promise<JobUnlockRequestApproveResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'jobEvent',
                action: 'job:unlock-request:approve',
                requestId,
                message: { jobId, requestId: unlockRequestId, respondedBy }
            },
            'jobUnlockRequestApproveResponse'
        );
    },

    rejectUnlockRequest: async (jobId: string, unlockRequestId: string, respondedBy: string): Promise<JobUnlockRequestRejectResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'jobEvent',
                action: 'job:unlock-request:reject',
                requestId,
                message: { jobId, requestId: unlockRequestId, respondedBy }
            },
            'jobUnlockRequestRejectResponse'
        );
    },

    deleteUnlockRequest: async (jobId: string, unlockRequestId: string): Promise<JobUnlockRequestDeleteResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'jobEvent',
                action: 'job:unlock-request:delete',
                requestId,
                message: { jobId, requestId: unlockRequestId }
            },
            'jobUnlockRequestDeleteResponse'
        );
    },

    // ================================
    // Job Bidding
    // ================================

    addBid: async (jobId: string, bid: AddBidData): Promise<JobBidAddResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'jobEvent',
                action: 'job:bid:add',
                requestId,
                message: { jobId, ...bid }
            },
            'jobBidAddResponse'
        );
    },

    withdrawBid: async (jobId: string, bidId: string): Promise<JobBidWithdrawResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'jobEvent',
                action: 'job:bid:withdraw',
                requestId,
                message: { jobId, bidId }
            },
            'jobBidWithdrawResponse'
        );
    },

    acceptBid: async (jobId: string, bidId: string): Promise<JobBidAcceptResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'jobEvent',
                action: 'job:bid:accept',
                requestId,
                message: { jobId, bidId }
            },
            'jobBidAcceptResponse'
        );
    },

    listBids: async (jobId: string): Promise<JobBidListResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'jobEvent',
                action: 'job:bid:list',
                requestId,
                message: { jobId }
            },
            'jobBidListResponse'
        );
    },

    // ================================
    // Job Blockers
    // ================================

    addBlocker: async (jobId: string, blocker: AddBlockerData): Promise<JobBlockerAddResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'jobEvent',
                action: 'job:blocker:add',
                requestId,
                message: { jobId, ...blocker }
            },
            'jobBlockerAddResponse'
        );
    },

    removeBlocker: async (jobId: string, blockerId: string): Promise<JobBlockerRemoveResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'jobEvent',
                action: 'job:blocker:remove',
                requestId,
                message: { jobId, blockerId }
            },
            'jobBlockerRemoveResponse'
        );
    },

    resolveBlocker: async (jobId: string, blockerId: string, resolvedBy: string): Promise<JobBlockerResolveResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'jobEvent',
                action: 'job:blocker:resolve',
                requestId,
                message: { jobId, blockerId, resolvedBy }
            },
            'jobBlockerResolveResponse'
        );
    }
};

export default jobService;

