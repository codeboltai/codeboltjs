import type { ClientConnection } from "../../types";
import type { TargetClient } from "../../shared/utils/ClientResolver";
import { BaseNotificationService } from "../../main/notificationManager/BaseNotificationService";

/**
 * Job notification types
 */
interface JobNotification {
    type: 'jobnotify';
    action: string;
    requestId: string;
    toolUseId: string;
    threadId: string;
    agentId: string;
    agentInstanceId?: string;
    content?: any;
    data?: any;
    isError?: boolean;
}

/**
 * Service for handling job-related notifications in the remote executor
 */
export class JobNotificationService extends BaseNotificationService {
    /**
     * Send job show result notification
     */
    sendJobShowResult(params: {
        agent: ClientConnection;
        requestId: string;
        job: any;
        targetClient?: TargetClient;
    }): void {
        const { agent, requestId, job, targetClient } = params;

        const notification: JobNotification = {
            action: "jobShowResult",
            content: job,
            data: { job },
            type: "jobnotify",
            requestId: requestId,
            toolUseId: requestId,
            threadId: agent.threadId,
            agentId: agent.id,
            agentInstanceId: agent.instanceId,
            isError: false
        };

        this.notifyClients(agent, notification, targetClient);
    }

    /**
     * Send job show error notification
     */
    sendJobShowError(params: {
        agent: ClientConnection;
        requestId: string;
        error: string;
        targetClient?: TargetClient;
    }): void {
        const { agent, requestId, error, targetClient } = params;

        const notification: JobNotification = {
            action: "jobShowResult",
            content: error,
            type: "jobnotify",
            requestId: requestId,
            toolUseId: requestId,
            threadId: agent.threadId,
            agentId: agent.id,
            agentInstanceId: agent.instanceId,
            isError: true
        };

        this.notifyClients(agent, notification, targetClient);
    }

    /**
     * Send job list result notification
     */
    sendJobListResult(params: {
        agent: ClientConnection;
        requestId: string;
        jobs: any[];
        totalCount: number;
        targetClient?: TargetClient;
    }): void {
        const { agent, requestId, jobs, totalCount, targetClient } = params;

        const notification: JobNotification = {
            action: "jobListResult",
            content: { jobs, totalCount },
            data: { jobs, totalCount },
            type: "jobnotify",
            requestId: requestId,
            toolUseId: requestId,
            threadId: agent.threadId,
            agentId: agent.id,
            agentInstanceId: agent.instanceId,
            isError: false
        };

        this.notifyClients(agent, notification, targetClient);
    }

    /**
     * Send job list error notification
     */
    sendJobListError(params: {
        agent: ClientConnection;
        requestId: string;
        error: string;
        targetClient?: TargetClient;
    }): void {
        const { agent, requestId, error, targetClient } = params;

        const notification: JobNotification = {
            action: "jobListResult",
            content: error,
            type: "jobnotify",
            requestId: requestId,
            toolUseId: requestId,
            threadId: agent.threadId,
            agentId: agent.id,
            agentInstanceId: agent.instanceId,
            isError: true
        };

        this.notifyClients(agent, notification, targetClient);
    }

    /**
     * Send job create result notification
     */
    sendJobCreateResult(params: {
        agent: ClientConnection;
        requestId: string;
        job: any;
        targetClient?: TargetClient;
    }): void {
        const { agent, requestId, job, targetClient } = params;

        const notification: JobNotification = {
            action: "jobCreateResult",
            content: job,
            data: { job },
            type: "jobnotify",
            requestId: requestId,
            toolUseId: requestId,
            threadId: agent.threadId,
            agentId: agent.id,
            agentInstanceId: agent.instanceId,
            isError: false
        };

        this.notifyClients(agent, notification, targetClient);
    }

    /**
     * Send job create error notification
     */
    sendJobCreateError(params: {
        agent: ClientConnection;
        requestId: string;
        error: string;
        targetClient?: TargetClient;
    }): void {
        const { agent, requestId, error, targetClient } = params;

        const notification: JobNotification = {
            action: "jobCreateResult",
            content: error,
            type: "jobnotify",
            requestId: requestId,
            toolUseId: requestId,
            threadId: agent.threadId,
            agentId: agent.id,
            agentInstanceId: agent.instanceId,
            isError: true
        };

        this.notifyClients(agent, notification, targetClient);
    }

    /**
     * Send job update result notification
     */
    sendJobUpdateResult(params: {
        agent: ClientConnection;
        requestId: string;
        job: any;
        targetClient?: TargetClient;
    }): void {
        const { agent, requestId, job, targetClient } = params;

        const notification: JobNotification = {
            action: "jobUpdateResult",
            content: job,
            data: { job },
            type: "jobnotify",
            requestId: requestId,
            toolUseId: requestId,
            threadId: agent.threadId,
            agentId: agent.id,
            agentInstanceId: agent.instanceId,
            isError: false
        };

        this.notifyClients(agent, notification, targetClient);
    }

    /**
     * Send job update error notification
     */
    sendJobUpdateError(params: {
        agent: ClientConnection;
        requestId: string;
        error: string;
        targetClient?: TargetClient;
    }): void {
        const { agent, requestId, error, targetClient } = params;

        const notification: JobNotification = {
            action: "jobUpdateResult",
            content: error,
            type: "jobnotify",
            requestId: requestId,
            toolUseId: requestId,
            threadId: agent.threadId,
            agentId: agent.id,
            agentInstanceId: agent.instanceId,
            isError: true
        };

        this.notifyClients(agent, notification, targetClient);
    }

    /**
     * Send job delete result notification
     */
    sendJobDeleteResult(params: {
        agent: ClientConnection;
        requestId: string;
        success: boolean;
        targetClient?: TargetClient;
    }): void {
        const { agent, requestId, success, targetClient } = params;

        const notification: JobNotification = {
            action: "jobDeleteResult",
            content: { deleted: success },
            data: { deleted: success },
            type: "jobnotify",
            requestId: requestId,
            toolUseId: requestId,
            threadId: agent.threadId,
            agentId: agent.id,
            agentInstanceId: agent.instanceId,
            isError: false
        };

        this.notifyClients(agent, notification, targetClient);
    }

    /**
     * Send job delete error notification
     */
    sendJobDeleteError(params: {
        agent: ClientConnection;
        requestId: string;
        error: string;
        targetClient?: TargetClient;
    }): void {
        const { agent, requestId, error, targetClient } = params;

        const notification: JobNotification = {
            action: "jobDeleteResult",
            content: error,
            type: "jobnotify",
            requestId: requestId,
            toolUseId: requestId,
            threadId: agent.threadId,
            agentId: agent.id,
            agentInstanceId: agent.instanceId,
            isError: true
        };

        this.notifyClients(agent, notification, targetClient);
    }

    /**
     * Send job lock acquire result notification
     */
    sendJobLockAcquireResult(params: {
        agent: ClientConnection;
        requestId: string;
        job: any;
        targetClient?: TargetClient;
    }): void {
        const { agent, requestId, job, targetClient } = params;

        const notification: JobNotification = {
            action: "jobLockAcquireResult",
            content: job,
            data: { job },
            type: "jobnotify",
            requestId: requestId,
            toolUseId: requestId,
            threadId: agent.threadId,
            agentId: agent.id,
            agentInstanceId: agent.instanceId,
            isError: false
        };

        this.notifyClients(agent, notification, targetClient);
    }

    /**
     * Send job lock release result notification
     */
    sendJobLockReleaseResult(params: {
        agent: ClientConnection;
        requestId: string;
        job: any;
        targetClient?: TargetClient;
    }): void {
        const { agent, requestId, job, targetClient } = params;

        const notification: JobNotification = {
            action: "jobLockReleaseResult",
            content: job,
            data: { job },
            type: "jobnotify",
            requestId: requestId,
            toolUseId: requestId,
            threadId: agent.threadId,
            agentId: agent.id,
            agentInstanceId: agent.instanceId,
            isError: false
        };

        this.notifyClients(agent, notification, targetClient);
    }
}
