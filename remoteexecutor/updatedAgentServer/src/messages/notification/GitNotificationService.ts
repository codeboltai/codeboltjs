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
    repositoryPath?: string;
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
        repositoryPath?: string;
        targetClient?: TargetClient;
    }): void {
        const { agent, requestId, success, message, repositoryPath, targetClient } = params;

        const notification: GitNotification = {
            action: "gitInitResult",
            content: message,
            data: { success, message, repositoryPath },
            type: "gitnotify",
            requestId: requestId,
            toolUseId: requestId,
            threadId: agent.threadId,
            agentId: agent.id,
            agentInstanceId: agent.instanceId,
            repositoryPath: repositoryPath,
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
        repositoryPath?: string;
        targetClient?: TargetClient;
    }): void {
        const { agent, requestId, success, message, repositoryPath, targetClient } = params;

        const notification: GitNotification = {
            action: "gitAddResult",
            content: message,
            data: { success, message, repositoryPath },
            type: "gitnotify",
            requestId: requestId,
            toolUseId: requestId,
            threadId: agent.threadId,
            agentId: agent.id,
            agentInstanceId: agent.instanceId,
            repositoryPath: repositoryPath,
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
        repositoryPath?: string;
        targetClient?: TargetClient;
    }): void {
        const { agent, requestId, success, message, commitHash, repositoryPath, targetClient } = params;

        const notification: GitNotification = {
            action: "gitCommitResult",
            content: message,
            data: { success, message, commitHash, repositoryPath },
            type: "gitnotify",
            requestId: requestId,
            toolUseId: requestId,
            threadId: agent.threadId,
            agentId: agent.id,
            agentInstanceId: agent.instanceId,
            repositoryPath: repositoryPath,
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
        repositoryPath?: string;
        targetClient?: TargetClient;
    }): void {
        const { agent, requestId, success, message, repositoryPath, targetClient } = params;

        const notification: GitNotification = {
            action: "gitPushResult",
            content: message,
            data: { success, message, repositoryPath },
            type: "gitnotify",
            requestId: requestId,
            toolUseId: requestId,
            threadId: agent.threadId,
            agentId: agent.id,
            agentInstanceId: agent.instanceId,
            repositoryPath: repositoryPath,
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
        repositoryPath?: string;
        targetClient?: TargetClient;
    }): void {
        const { agent, requestId, success, message, repositoryPath, targetClient } = params;

        const notification: GitNotification = {
            action: "gitPullResult",
            content: message,
            data: { success, message, repositoryPath },
            type: "gitnotify",
            requestId: requestId,
            toolUseId: requestId,
            threadId: agent.threadId,
            agentId: agent.id,
            agentInstanceId: agent.instanceId,
            repositoryPath: repositoryPath,
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
        repositoryPath?: string;
        targetClient?: TargetClient;
    }): void {
        const { agent, requestId, success, message, branch, repositoryPath, targetClient } = params;

        const notification: GitNotification = {
            action: "gitCheckoutResult",
            content: message,
            data: { success, message, branch, repositoryPath },
            type: "gitnotify",
            requestId: requestId,
            toolUseId: requestId,
            threadId: agent.threadId,
            agentId: agent.id,
            agentInstanceId: agent.instanceId,
            repositoryPath: repositoryPath,
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
        repositoryPath?: string;
        targetClient?: TargetClient;
    }): void {
        const { agent, requestId, success, message, branch, repositoryPath, targetClient } = params;

        const notification: GitNotification = {
            action: "gitBranchResult",
            content: message,
            data: { success, message, branch, repositoryPath },
            type: "gitnotify",
            requestId: requestId,
            toolUseId: requestId,
            threadId: agent.threadId,
            agentId: agent.id,
            agentInstanceId: agent.instanceId,
            repositoryPath: repositoryPath,
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
        repositoryPath?: string;
        targetClient?: TargetClient;
    }): void {
        const { agent, requestId, success, message, logs, repositoryPath, targetClient } = params;

        const notification: GitNotification = {
            action: "gitLogsResult",
            content: logs,
            data: { success, message, logs, repositoryPath },
            type: "gitnotify",
            requestId: requestId,
            toolUseId: requestId,
            threadId: agent.threadId,
            agentId: agent.id,
            agentInstanceId: agent.instanceId,
            repositoryPath: repositoryPath,
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
        repositoryPath?: string;
        targetClient?: TargetClient;
    }): void {
        const { agent, requestId, success, message, diff, repositoryPath, targetClient } = params;

        const notification: GitNotification = {
            action: "gitDiffResult",
            content: diff,
            data: { success, message, diff, repositoryPath },
            type: "gitnotify",
            requestId: requestId,
            toolUseId: requestId,
            threadId: agent.threadId,
            agentId: agent.id,
            agentInstanceId: agent.instanceId,
            repositoryPath: repositoryPath,
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
        repositoryPath?: string;
        targetClient?: TargetClient;
    }): void {
        const { agent, requestId, success, message, status, repositoryPath, targetClient } = params;

        const notification: GitNotification = {
            action: "gitStatusResult",
            content: status,
            data: { success, message, status, repositoryPath },
            type: "gitnotify",
            requestId: requestId,
            toolUseId: requestId,
            threadId: agent.threadId,
            agentId: agent.id,
            agentInstanceId: agent.instanceId,
            repositoryPath: repositoryPath,
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
        repositoryPath?: string;
        targetClient?: TargetClient;
    }): void {
        const { agent, requestId, success, message, url, repositoryPath, targetClient } = params;

        const notification: GitNotification = {
            action: "gitCloneResult",
            content: message,
            data: { success, message, url, repositoryPath },
            type: "gitnotify",
            requestId: requestId,
            toolUseId: requestId,
            threadId: agent.threadId,
            agentId: agent.id,
            agentInstanceId: agent.instanceId,
            repositoryPath: repositoryPath,
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
        repositoryPath?: string;
        targetClient?: TargetClient;
    }): void {
        const { agent, requestId, action, error, repositoryPath, targetClient } = params;

        const notification: GitNotification = {
            action: `${action}Result`,
            content: error,
            data: { success: false, error, repositoryPath },
            type: "gitnotify",
            requestId: requestId,
            toolUseId: requestId,
            threadId: agent.threadId,
            agentId: agent.id,
            agentInstanceId: agent.instanceId,
            repositoryPath: repositoryPath,
            isError: true
        };

        this.notifyClients(agent, notification, targetClient);
    }
}
