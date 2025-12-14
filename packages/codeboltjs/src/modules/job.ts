import cbws from '../core/websocket';
import { randomUUID } from 'crypto';
import type {
    CreateJobData,
    CreateJobGroupData,
    DependencyType,
    Job,
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
    UpdateJobData
} from '../types/job';

/**
 * Job service client for codeboltjs.
 * Mirrors backend CLI job operations exposed via WebSocket (jobEvent).
 * Follows the same pattern as task.ts and todo.ts modules.
 */
const jobService = {
    // Job CRUD Operations
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

    // Job Group Operations
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

    // Dependency Operations
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

    // Ready/Blocked Operations
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

    // Label Operations
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
    }
};

export default jobService;
