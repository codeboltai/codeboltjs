import type { ClientConnection } from '../../types';
import { formatLogMessage } from '../../types/utils';
import { ConnectionManager } from '../../main/core/connectionManagers/connectionManager.js';
import { logger } from '../../main/utils/logger';
import { GitService } from './gitService';
import { GitNotificationService } from '../../messages/notification/GitNotificationService';
import { ClientResolver, type TargetClient } from '../../shared/utils/ClientResolver';
import type {
    GitEvent,
    GitCommitEvent,
    GitCheckoutEvent,
    GitBranchEvent,
    GitDiffEvent,
} from '@codebolt/types/agent-to-app-ws-types';
import type { GitServiceResponse } from '@codebolt/types/app-to-agent-ws-types';

import { getServerConfig } from '../../main/config/config';

/**
 * Handler for git events from agents
 */
export class GitHandler {
    private connectionManager = ConnectionManager.getInstance();
    private gitService: GitService;
    private gitNotificationService = new GitNotificationService();
    private clientResolver = new ClientResolver();

    constructor() {
        const config = getServerConfig();
        this.gitService = new GitService(config.projectPath);
    }

    /**
     * Handle git events from agents
     */
    async handleGitEvent(agent: ClientConnection, event: GitEvent): Promise<void> {
        const action = event.action || '';
        const requestId = event.requestId || '';
        const targetClient = this.clientResolver.resolveParent(agent);
        const repositoryPath = this.gitService.getRepositoryPath();

        logger.info(
            formatLogMessage('info', 'GitHandler', `Handling git event: ${action} from ${agent.id}`)
        );

        try {
            let response: GitServiceResponse;

            switch (action) {
                case 'Init': {
                    const result = await this.gitService.init();
                    response = {
                        type: 'gitInitResponse',
                        requestId,
                        success: result.success,
                        message: result.message,
                        timestamp: new Date().toISOString(),
                    };
                    // Send notification
                    this.gitNotificationService.sendGitInitResult({
                        agent,
                        requestId,
                        success: result.success,
                        message: result.message || '',
                        repositoryPath,
                        targetClient,
                    });
                    break;
                }

                case 'Add': {
                    const result = await this.gitService.add();
                    response = {
                        type: 'AddResponse',
                        requestId,
                        success: result.success,
                        message: result.message,
                        content: '',
                        timestamp: new Date().toISOString(),
                    };
                    // Send notification
                    this.gitNotificationService.sendGitAddResult({
                        agent,
                        requestId,
                        success: result.success,
                        message: result.message || '',
                        repositoryPath,
                        targetClient,
                    });
                    break;
                }

                case 'Commit': {
                    const commitEvent = event as GitCommitEvent;
                    const commitMessage = commitEvent.message || '';
                    if (!commitMessage) {
                        throw new Error('Commit message is required');
                    }
                    const result = await this.gitService.commit(commitMessage);
                    response = {
                        type: 'gitCommitResponse',
                        requestId,
                        success: result.success,
                        message: result.message,
                        content: commitEvent.message,
                        timestamp: new Date().toISOString(),
                    };
                    // Send notification
                    this.gitNotificationService.sendGitCommitResult({
                        agent,
                        requestId,
                        success: result.success,
                        message: result.message || '',
                        repositoryPath,
                        targetClient,
                    });
                    break;
                }

                case 'Push': {
                    const result = await this.gitService.push();
                    response = {
                        type: 'gitPushResponse',
                        requestId,
                        success: result.success,
                        message: result.message,
                        timestamp: new Date().toISOString(),
                    };
                    // Send notification
                    this.gitNotificationService.sendGitPushResult({
                        agent,
                        requestId,
                        success: result.success,
                        message: result.message || '',
                        repositoryPath,
                        targetClient,
                    });
                    break;
                }

                case 'Pull': {
                    const result = await this.gitService.pull();
                    response = {
                        type: 'gitPullResponse',
                        requestId,
                        success: result.success,
                        message: result.message,
                        timestamp: new Date().toISOString(),
                    };
                    // Send notification
                    this.gitNotificationService.sendGitPullResult({
                        agent,
                        requestId,
                        success: result.success,
                        message: result.message || '',
                        repositoryPath,
                        targetClient,
                    });
                    break;
                }

                case 'Checkout': {
                    const checkoutEvent = event as GitCheckoutEvent;
                    const branchName = checkoutEvent.branch || '';
                    if (!branchName) {
                        throw new Error('Branch name is required');
                    }
                    const result = await this.gitService.checkout(branchName);
                    response = {
                        type: 'gitCheckoutResponse',
                        requestId,
                        success: result.success,
                        message: result.message,
                        branch: result.branch,
                        timestamp: new Date().toISOString(),
                    };
                    // Send notification
                    this.gitNotificationService.sendGitCheckoutResult({
                        agent,
                        requestId,
                        success: result.success,
                        message: result.message || '',
                        branch: result.branch || branchName,
                        repositoryPath,
                        targetClient,
                    });
                    break;
                }

                case 'gitBranch': {
                    const branchEvent = event as GitBranchEvent;
                    const newBranchName = branchEvent.branch || '';
                    if (!newBranchName) {
                        throw new Error('Branch name is required');
                    }
                    const result = await this.gitService.branch(newBranchName);
                    response = {
                        type: 'gitBranchResponse',
                        requestId,
                        success: result.success,
                        message: result.message,
                        branch: result.branch,
                        timestamp: new Date().toISOString(),
                    };
                    // Send notification
                    this.gitNotificationService.sendGitBranchResult({
                        agent,
                        requestId,
                        success: result.success,
                        message: result.message || '',
                        branch: result.branch || newBranchName,
                        repositoryPath,
                        targetClient,
                    });
                    break;
                }

                case 'gitLogs': {
                    const result = await this.gitService.logs();
                    response = {
                        type: 'gitLogsResponse',
                        requestId,
                        success: result.success,
                        message: result.message,
                        data: result.data,
                        timestamp: new Date().toISOString(),
                    };
                    // Send notification
                    this.gitNotificationService.sendGitLogsResult({
                        agent,
                        requestId,
                        success: result.success,
                        message: result.message || '',
                        logs: result.data,
                        repositoryPath,
                        targetClient,
                    });
                    break;
                }

                case 'Diff': {
                    const diffEvent = event as GitDiffEvent;
                    const result = await this.gitService.diff(diffEvent.commitHash);
                    response = {
                        type: 'gitDiffResponse',
                        requestId,
                        success: result.success,
                        message: result.message,
                        data: result.data,
                        timestamp: new Date().toISOString(),
                    };
                    // Send notification
                    this.gitNotificationService.sendGitDiffResult({
                        agent,
                        requestId,
                        success: result.success,
                        message: result.message || '',
                        diff: result.data || '',
                        repositoryPath,
                        targetClient,
                    });
                    break;
                }

                case 'Status': {
                    const result = await this.gitService.status();
                    response = {
                        type: 'gitStatusResponse',
                        requestId,
                        success: result.success,
                        message: result.message,
                        data: result.data,
                        timestamp: new Date().toISOString(),
                    };
                    // Send notification
                    this.gitNotificationService.sendGitStatusResult({
                        agent,
                        requestId,
                        success: result.success,
                        message: result.message || '',
                        status: result.data,
                        repositoryPath,
                        targetClient,
                    });
                    break;
                }

                case 'Clone': {
                    const cloneEvent = event as { url: string; path?: string };
                    const cloneUrl = cloneEvent.url || '';
                    if (!cloneUrl) {
                        throw new Error('Clone URL is required');
                    }
                    const result = await this.gitService.clone(cloneUrl, cloneEvent.path);
                    response = {
                        type: 'gitCloneResponse',
                        requestId,
                        success: result.success,
                        message: result.message,
                        url: result.url,
                        timestamp: new Date().toISOString(),
                    };
                    // Send notification
                    this.gitNotificationService.sendGitCloneResult({
                        agent,
                        requestId,
                        success: result.success,
                        message: result.message || '',
                        url: result.url || cloneUrl,
                        repositoryPath: cloneEvent.path || repositoryPath,
                        targetClient,
                    });
                    break;
                }

                default:
                    response = {
                        type: 'error',
                        requestId,
                        success: false,
                        message: `Unknown git action: ${action}`,
                        error: `Unknown git action: ${action}`,
                        timestamp: new Date().toISOString(),
                    };
                    // Send error notification for unknown action
                    this.gitNotificationService.sendGitError({
                        agent,
                        requestId,
                        action,
                        error: `Unknown git action: ${action}`,
                        repositoryPath,
                        targetClient,
                    });
            }

            this.connectionManager.sendToConnection(agent.id, {
                ...response,
                clientId: agent.id,
            });
        } catch (error) {
            logger.error(
                formatLogMessage('error', 'GitHandler', `Error handling git event: ${action}`),
                error
            );

            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            const errorResponse: GitServiceResponse = {
                type: 'error',
                requestId,
                success: false,
                message: errorMessage,
                error: errorMessage,
                timestamp: new Date().toISOString(),
            };

            this.connectionManager.sendToConnection(agent.id, {
                ...errorResponse,
                clientId: agent.id,
            });

            // Send error notification
            this.gitNotificationService.sendGitError({
                agent,
                requestId,
                action,
                error: errorMessage,
                repositoryPath,
                targetClient,
            });
        }
    }
}
