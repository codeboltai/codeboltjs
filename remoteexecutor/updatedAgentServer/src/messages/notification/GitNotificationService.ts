import type { ClientConnection } from "../../types";
import type { TargetClient } from "../../shared/utils/ClientResolver";
import { BaseNotificationService } from "../../main/notificationManager/BaseNotificationService";

/**
 * Git notification types
 */
interface GitNotification {
    type: 'gitnotify';
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
 * Service for handling git-related notifications in the remote executor
 */
export class GitNotificationService extends BaseNotificationService {
    /**
     * Send git init result notification
     */
    sendGitInitResult(params: {
        agent: ClientConnection;
        requestId: string;
        success: boolean;
        message: string;
        targetClient?: TargetClient;
    }): void {
        const { agent, requestId, success, message, targetClient } = params;

        const notification: GitNotification = {
            action: "gitInitResult",
            content: message,
            data: { success, message },
            type: "gitnotify",
            requestId: requestId,
            toolUseId: requestId,
            threadId: agent.threadId,
            agentId: agent.id,
            agentInstanceId: agent.instanceId,
            isError: !success
        };

        this.notifyClients(agent, notification, targetClient);
    }

    /**
     * Send git add result notification
     */
    sendGitAddResult(params: {
        agent: ClientConnection;
        requestId: string;
        success: boolean;
        message: string;
        targetClient?: TargetClient;
    }): void {
        const { agent, requestId, success, message, targetClient } = params;

        const notification: GitNotification = {
            action: "gitAddResult",
            content: message,
            data: { success, message },
            type: "gitnotify",
            requestId: requestId,
            toolUseId: requestId,
            threadId: agent.threadId,
            agentId: agent.id,
            agentInstanceId: agent.instanceId,
            isError: !success
        };

        this.notifyClients(agent, notification, targetClient);
    }

    /**
     * Send git commit result notification
     */
    sendGitCommitResult(params: {
        agent: ClientConnection;
        requestId: string;
        success: boolean;
        message: string;
        commitHash?: string;
        targetClient?: TargetClient;
    }): void {
        const { agent, requestId, success, message, commitHash, targetClient } = params;

        const notification: GitNotification = {
            action: "gitCommitResult",
            content: message,
            data: { success, message, commitHash },
            type: "gitnotify",
            requestId: requestId,
            toolUseId: requestId,
            threadId: agent.threadId,
            agentId: agent.id,
            agentInstanceId: agent.instanceId,
            isError: !success
        };

        this.notifyClients(agent, notification, targetClient);
    }

    /**
     * Send git push result notification
     */
    sendGitPushResult(params: {
        agent: ClientConnection;
        requestId: string;
        success: boolean;
        message: string;
        targetClient?: TargetClient;
    }): void {
        const { agent, requestId, success, message, targetClient } = params;

        const notification: GitNotification = {
            action: "gitPushResult",
            content: message,
            data: { success, message },
            type: "gitnotify",
            requestId: requestId,
            toolUseId: requestId,
            threadId: agent.threadId,
            agentId: agent.id,
            agentInstanceId: agent.instanceId,
            isError: !success
        };

        this.notifyClients(agent, notification, targetClient);
    }

    /**
     * Send git pull result notification
     */
    sendGitPullResult(params: {
        agent: ClientConnection;
        requestId: string;
        success: boolean;
        message: string;
        targetClient?: TargetClient;
    }): void {
        const { agent, requestId, success, message, targetClient } = params;

        const notification: GitNotification = {
            action: "gitPullResult",
            content: message,
            data: { success, message },
            type: "gitnotify",
            requestId: requestId,
            toolUseId: requestId,
            threadId: agent.threadId,
            agentId: agent.id,
            agentInstanceId: agent.instanceId,
            isError: !success
        };

        this.notifyClients(agent, notification, targetClient);
    }

    /**
     * Send git checkout result notification
     */
    sendGitCheckoutResult(params: {
        agent: ClientConnection;
        requestId: string;
        success: boolean;
        message: string;
        branch: string;
        targetClient?: TargetClient;
    }): void {
        const { agent, requestId, success, message, branch, targetClient } = params;

        const notification: GitNotification = {
            action: "gitCheckoutResult",
            content: message,
            data: { success, message, branch },
            type: "gitnotify",
            requestId: requestId,
            toolUseId: requestId,
            threadId: agent.threadId,
            agentId: agent.id,
            agentInstanceId: agent.instanceId,
            isError: !success
        };

        this.notifyClients(agent, notification, targetClient);
    }

    /**
     * Send git branch result notification
     */
    sendGitBranchResult(params: {
        agent: ClientConnection;
        requestId: string;
        success: boolean;
        message: string;
        branch: string;
        targetClient?: TargetClient;
    }): void {
        const { agent, requestId, success, message, branch, targetClient } = params;

        const notification: GitNotification = {
            action: "gitBranchResult",
            content: message,
            data: { success, message, branch },
            type: "gitnotify",
            requestId: requestId,
            toolUseId: requestId,
            threadId: agent.threadId,
            agentId: agent.id,
            agentInstanceId: agent.instanceId,
            isError: !success
        };

        this.notifyClients(agent, notification, targetClient);
    }

    /**
     * Send git logs result notification
     */
    sendGitLogsResult(params: {
        agent: ClientConnection;
        requestId: string;
        success: boolean;
        message: string;
        logs: any;
        targetClient?: TargetClient;
    }): void {
        const { agent, requestId, success, message, logs, targetClient } = params;

        const notification: GitNotification = {
            action: "gitLogsResult",
            content: logs,
            data: { success, message, logs },
            type: "gitnotify",
            requestId: requestId,
            toolUseId: requestId,
            threadId: agent.threadId,
            agentId: agent.id,
            agentInstanceId: agent.instanceId,
            isError: !success
        };

        this.notifyClients(agent, notification, targetClient);
    }

    /**
     * Send git diff result notification
     */
    sendGitDiffResult(params: {
        agent: ClientConnection;
        requestId: string;
        success: boolean;
        message: string;
        diff: string;
        targetClient?: TargetClient;
    }): void {
        const { agent, requestId, success, message, diff, targetClient } = params;

        const notification: GitNotification = {
            action: "gitDiffResult",
            content: diff,
            data: { success, message, diff },
            type: "gitnotify",
            requestId: requestId,
            toolUseId: requestId,
            threadId: agent.threadId,
            agentId: agent.id,
            agentInstanceId: agent.instanceId,
            isError: !success
        };

        this.notifyClients(agent, notification, targetClient);
    }

    /**
     * Send git status result notification
     */
    sendGitStatusResult(params: {
        agent: ClientConnection;
        requestId: string;
        success: boolean;
        message: string;
        status: any;
        targetClient?: TargetClient;
    }): void {
        const { agent, requestId, success, message, status, targetClient } = params;

        const notification: GitNotification = {
            action: "gitStatusResult",
            content: status,
            data: { success, message, status },
            type: "gitnotify",
            requestId: requestId,
            toolUseId: requestId,
            threadId: agent.threadId,
            agentId: agent.id,
            agentInstanceId: agent.instanceId,
            isError: !success
        };

        this.notifyClients(agent, notification, targetClient);
    }

    /**
     * Send git clone result notification
     */
    sendGitCloneResult(params: {
        agent: ClientConnection;
        requestId: string;
        success: boolean;
        message: string;
        url: string;
        targetClient?: TargetClient;
    }): void {
        const { agent, requestId, success, message, url, targetClient } = params;

        const notification: GitNotification = {
            action: "gitCloneResult",
            content: message,
            data: { success, message, url },
            type: "gitnotify",
            requestId: requestId,
            toolUseId: requestId,
            threadId: agent.threadId,
            agentId: agent.id,
            agentInstanceId: agent.instanceId,
            isError: !success
        };

        this.notifyClients(agent, notification, targetClient);
    }

    /**
     * Send generic git error notification
     */
    sendGitError(params: {
        agent: ClientConnection;
        requestId: string;
        action: string;
        error: string;
        targetClient?: TargetClient;
    }): void {
        const { agent, requestId, action, error, targetClient } = params;

        const notification: GitNotification = {
            action: `${action}Result`,
            content: error,
            data: { success: false, error },
            type: "gitnotify",
            requestId: requestId,
            toolUseId: requestId,
            threadId: agent.threadId,
            agentId: agent.id,
            agentInstanceId: agent.instanceId,
            isError: true
        };

        this.notifyClients(agent, notification, targetClient);
    }
}
