import {
  ClientConnection,
  formatLogMessage
} from './../../types';
import { NotificationService } from '../../services/NotificationService';
import type { GitEvent, GitInitEvent, GitCommitEvent, GitCheckoutEvent, GitBranchEvent, GitDiffEvent } from '@codebolt/types/agent-to-app-ws-types';
import type { 
  GitInitResponseNotification,
  GitPullResponseNotification,
  GitPushResponseNotification,
  GitStatusResponseNotification,
  GitAddResponseNotification,
  GitCommitResponseNotification,
  GitCheckoutResponseNotification,
  GitBranchResponseNotification,
  GitLogsResponseNotification,
  GitDiffResponseNotification,
  GitCloneResponseNotification
} from '@codebolt/types/agent-to-app-ws-types';
import { ConnectionManager } from '../../core/connectionManager';
import simpleGit from 'simple-git';
import path from 'path';

/**
 * Handles git events with notifications (following readFileHandler pattern)
 */
export class GitHandler {
  private notificationService: NotificationService;
  private connectionManager: ConnectionManager;

  constructor() {
    this.notificationService = NotificationService.getInstance();
    this.connectionManager = ConnectionManager.getInstance();
  }

  /**
   * Handle git events with actual Git operations (following readFileHandler pattern)
   */
  handleGitEvent(agent: ClientConnection, gitEvent: GitEvent) {
    const requestId = gitEvent.requestId;
    const action = (gitEvent as any).action as string;
    console.log(formatLogMessage('info', 'GitHandler', `Handling git event: ${action} from ${agent.id}`));
    
    // Get working directory - default to current working directory or from event data
    const workingDir = this.getWorkingDirectory(gitEvent);
    console.log(formatLogMessage('info', 'GitHandler', `Using working directory: ${workingDir}`));

    // Execute actual Git operations
    switch (action) {
      case 'Init':
        {
          console.log(formatLogMessage('info', 'GitHandler', `Sent git init request notification`));
          
          (async () => {
            try {
              const initEvent = gitEvent as GitInitEvent;
              const targetDir = initEvent.path ? path.resolve(initEvent.path) : workingDir;
              const git = simpleGit(targetDir);
              await git.init();
              
              const response = {
                success: true,
                data: { initialized: true },
                type: 'initResponse',
                id: requestId,
                message: 'Git repository initialized'
              };
              
              this.connectionManager.sendToConnection(agent.id, { ...response, clientId: agent.id });

              // Send response notification to app
              const responseNotification: GitInitResponseNotification = {
                requestId: requestId,
                toolUseId: requestId,
                type: 'gitnotify',
                action: 'initResult',
                content: {
                  success: true,
                  message: 'Git repository initialized'
                },
                isError: false
              };

              this.notificationService.sendToAppRelatedToAgentId(agent.id, responseNotification as any);
              console.log(formatLogMessage('info', 'GitHandler', `Sent git init response notification`));

            } catch (error) {
              const errorResponse = {
                success: false,
                error: `Failed to initialize git repository: ${error}`,
                type: 'initResponse',
                id: requestId
              };

              this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });

              // Send error notification to app
              const errorNotification: GitInitResponseNotification = {
                requestId: requestId,
                toolUseId: requestId,
                type: 'gitnotify',
                action: 'initResult',
                content: {
                  success: false,
                  message: error instanceof Error ? error.message : String(error)
                },
                isError: true
              };

              this.notificationService.sendToAppRelatedToAgentId(agent.id, errorNotification as any);
            }
          })();
        }
        break;

      case 'Pull':
        {
          console.log(formatLogMessage('info', 'GitHandler', `Sent git pull request notification`));
          
          (async () => {
            try {
              const git = simpleGit(workingDir);
              const result = await git.pull();
              
              const response = {
                success: true,
                data: result,
                type: 'pullResponse',
                id: requestId,
                message: 'Changes pulled from remote repository'
              };
              
              this.connectionManager.sendToConnection(agent.id, { ...response, clientId: agent.id });

              // Send response notification to app
              const responseNotification: GitPullResponseNotification = {
                requestId: requestId,
                toolUseId: requestId,
                type: 'gitnotify',
                action: 'pullResult',
                content: `Pull completed: ${result.summary?.changes || 0} changes`,
                isError: false
              };

              this.notificationService.sendToAppRelatedToAgentId(agent.id, responseNotification as any);
              console.log(formatLogMessage('info', 'GitHandler', `Sent git pull response notification`));

            } catch (error) {
              const errorResponse = {
                success: false,
                error: `Failed to pull from remote: ${error}`,
                type: 'pullResponse',
                id: requestId
              };

              this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });

              // Send error notification to app
              const errorNotification: GitPullResponseNotification = {
                requestId: requestId,
                toolUseId: requestId,
                type: 'gitnotify',
                action: 'pullResult',
                content: error instanceof Error ? error.message : String(error),
                isError: true
              };

              this.notificationService.sendToAppRelatedToAgentId(agent.id, errorNotification as any);
            }
          })();
        }
        break;

      case 'Push':
        {
          console.log(formatLogMessage('info', 'GitHandler', `Sent git push request notification`));
          
          (async () => {
            try {
              const git = simpleGit(workingDir);
              const result = await git.push();
              
              const response = {
                success: true,
                data: result,
                type: 'pushResponse',
                id: requestId,
                message: 'Changes pushed to remote repository'
              };
              
              this.connectionManager.sendToConnection(agent.id, { ...response, clientId: agent.id });

              // Send response notification to app
              const responseNotification: GitPushResponseNotification = {
                requestId: requestId,
                toolUseId: requestId,
                type: 'gitnotify',
                action: 'pushResult',
                content: `Push completed successfully`,
                isError: false
              };

              this.notificationService.sendToAppRelatedToAgentId(agent.id, responseNotification as any);
              console.log(formatLogMessage('info', 'GitHandler', `Sent git push response notification`));

            } catch (error) {
              const errorResponse = {
                success: false,
                error: `Failed to push to remote: ${error}`,
                type: 'pushResponse',
                id: requestId
              };

              this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });

              // Send error notification to app
              const errorNotification: GitPushResponseNotification = {
                requestId: requestId,
                toolUseId: requestId,
                type: 'gitnotify',
                action: 'pushResult',
                content: error instanceof Error ? error.message : String(error),
                isError: true
              };

              this.notificationService.sendToAppRelatedToAgentId(agent.id, errorNotification as any);
            }
          })();
        }
        break;

      case 'Status':
        {
          console.log(formatLogMessage('info', 'GitHandler', `Sent git status request notification`));
          
          (async () => {
            try {
              const git = simpleGit(workingDir);
              const status = await git.status();
              
              const response = {
                success: true,
                data: status,
                type: 'statusResponse',
                id: requestId,
                message: 'Git status retrieved'
              };
              
              this.connectionManager.sendToConnection(agent.id, { ...response, clientId: agent.id });

              // Send response notification to app
              const responseNotification: GitStatusResponseNotification = {
                requestId: requestId,
                toolUseId: requestId,
                type: 'gitnotify',
                action: 'statusResult',
                content: {
                  files: status.files.map(file => ({
                    path: file.path,
                    index: file.index || '',
                    working_dir: file.working_dir || ''
                  })),
                  modified: status.modified,
                  not_added: status.not_added,
                  conflicted: status.conflicted,
                  created: status.created,
                  deleted: status.deleted,
                  renamed: status.renamed.map(item => typeof item === 'string' ? item : item.to || ''),
                  staged: status.staged,
                  ahead: status.ahead,
                  behind: status.behind,
                  current: status.current,
                  tracking: status.tracking,
                  detached: status.detached
                },
                isError: false
              };

              this.notificationService.sendToAppRelatedToAgentId(agent.id, responseNotification as any);
              console.log(formatLogMessage('info', 'GitHandler', `Sent git status response notification`));

            } catch (error) {
              const errorResponse = {
                success: false,
                error: `Failed to get git status: ${error}`,
                type: 'statusResponse',
                id: requestId
              };

              this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });

              // Send error notification to app
              const errorNotification: GitStatusResponseNotification = {
                requestId: requestId,
                toolUseId: requestId,
                type: 'gitnotify',
                action: 'statusResult',
                content: {
                  success: false,
                  data: {
                    files: [],
                    modified: [],
                    not_added: [],
                    conflicted: [],
                    created: [],
                    deleted: [],
                    renamed: [],
                    staged: [],
                    ahead: 0,
                    behind: 0,
                    current: null,
                    tracking: null,
                    detached: false
                  },
                  message: error instanceof Error ? error.message : String(error)
                },
                isError: true
              };

              this.notificationService.sendToAppRelatedToAgentId(agent.id, errorNotification as any);
            }
          })();
        }
        break;

      case 'Add':
        {
          console.log(formatLogMessage('info', 'GitHandler', `Sent git add request notification`));
          
          (async () => {
            try {
              const git = simpleGit(workingDir);
              await git.add('.');
              
              const response = {
                success: true,
                data: { added: true },
                type: 'addResponse',
                id: requestId,
                message: 'Files added to git staging area'
              };
              
              this.connectionManager.sendToConnection(agent.id, { ...response, clientId: agent.id });

              // Send response notification to app
              const responseNotification: GitAddResponseNotification = {
                requestId: requestId,
                toolUseId: requestId,
                type: 'gitnotify',
                action: 'addResult',
                content: 'Files added to staging area',
                isError: false
              };

              this.notificationService.sendToAppRelatedToAgentId(agent.id, responseNotification as any);
              console.log(formatLogMessage('info', 'GitHandler', `Sent git add response notification`));

            } catch (error) {
              const errorResponse = {
                success: false,
                error: `Failed to add files: ${error}`,
                type: 'addResponse',
                id: requestId
              };

              this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });

              // Send error notification to app
              const errorNotification: GitAddResponseNotification = {
                requestId: requestId,
                toolUseId: requestId,
                type: 'gitnotify',
                action: 'addResult',
                content: error instanceof Error ? error.message : String(error),
                isError: true
              };

              this.notificationService.sendToAppRelatedToAgentId(agent.id, errorNotification as any);
            }
          })();
        }
        break;

      case 'Commit':
        {
          console.log(formatLogMessage('info', 'GitHandler', `Sent git commit request notification`));
          
          (async () => {
            try {
              const commitEvent = gitEvent as GitCommitEvent;
              if (!commitEvent.message) {
                throw new Error('Commit message is required');
              }

              const git = simpleGit(workingDir);
              await git.add('.');
              const result = await git.commit(commitEvent.message);
              
              const response = {
                success: true,
                data: result,
                type: 'commitResponse',
                id: requestId,
                message: `Committed with message: ${commitEvent.message}`
              };
              
              this.connectionManager.sendToConnection(agent.id, { ...response, clientId: agent.id });

              // Send response notification to app
              const responseNotification: GitCommitResponseNotification = {
                requestId: requestId,
                toolUseId: requestId,
                type: 'gitnotify',
                action: 'commitResult',
                content: `Commit created: ${result.commit}`,
                isError: false
              };

              this.notificationService.sendToAppRelatedToAgentId(agent.id, responseNotification as any);
              console.log(formatLogMessage('info', 'GitHandler', `Sent git commit response notification`));

            } catch (error) {
              const errorResponse = {
                success: false,
                error: `Failed to commit: ${error}`,
                type: 'commitResponse',
                id: requestId
              };

              this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });

              // Send error notification to app
              const errorNotification: GitCommitResponseNotification = {
                requestId: requestId,
                toolUseId: requestId,
                type: 'gitnotify',
                action: 'commitResult',
                content: error instanceof Error ? error.message : String(error),
                isError: true
              };

              this.notificationService.sendToAppRelatedToAgentId(agent.id, errorNotification as any);
            }
          })();
        }
        break;

      case 'Checkout':
        {
          console.log(formatLogMessage('info', 'GitHandler', `Sent git checkout request notification`));
          
          (async () => {
            try {
              const checkoutEvent = gitEvent as GitCheckoutEvent;
              if (!checkoutEvent.branch) {
                throw new Error('Branch name is required');
              }

              const git = simpleGit(workingDir);
              await git.checkout(checkoutEvent.branch);
              
              const response = {
                success: true,
                data: { branch: checkoutEvent.branch },
                type: 'checkoutResponse',
                id: requestId,
                message: `Checked out to branch: ${checkoutEvent.branch}`
              };
              
              this.connectionManager.sendToConnection(agent.id, { ...response, clientId: agent.id });

              // Send response notification to app
              const responseNotification: GitCheckoutResponseNotification = {
                requestId: requestId,
                toolUseId: requestId,
                type: 'gitnotify',
                action: 'checkoutResult',
                content: `Checked out to branch: ${checkoutEvent.branch}`,
                isError: false
              };

              this.notificationService.sendToAppRelatedToAgentId(agent.id, responseNotification as any);
              console.log(formatLogMessage('info', 'GitHandler', `Sent git checkout response notification`));

            } catch (error) {
              const errorResponse = {
                success: false,
                error: `Failed to checkout branch: ${error}`,
                type: 'checkoutResponse',
                id: requestId
              };

              this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });

              // Send error notification to app
              const errorNotification: GitCheckoutResponseNotification = {
                requestId: requestId,
                toolUseId: requestId,
                type: 'gitnotify',
                action: 'checkoutResult',
                content: error instanceof Error ? error.message : String(error),
                isError: true
              };

              this.notificationService.sendToAppRelatedToAgentId(agent.id, errorNotification as any);
            }
          })();
        }
        break;

      case 'gitBranch':
        {
          console.log(formatLogMessage('info', 'GitHandler', `Sent git branch request notification`));
          
          (async () => {
            try {
              const branchEvent = gitEvent as GitBranchEvent;
              if (!branchEvent.branch) {
                throw new Error('Branch name is required');
              }

              const git = simpleGit(workingDir);
              try {
                await git.checkoutLocalBranch(branchEvent.branch);
              } catch (error) {
                // If branch already exists, just checkout to it
                await git.checkout(branchEvent.branch);
              }
              
              const response = {
                success: true,
                data: { branch: branchEvent.branch },
                type: 'branchResponse',
                id: requestId,
                message: `Created branch: ${branchEvent.branch}`
              };
              
              this.connectionManager.sendToConnection(agent.id, { ...response, clientId: agent.id });

              // Send response notification to app
              const responseNotification: GitBranchResponseNotification = {
                requestId: requestId,
                toolUseId: requestId,
                type: 'gitnotify',
                action: 'branchResult',
                content: {
                  all: [branchEvent.branch],
                  current: branchEvent.branch,
                  branches: {
                    [branchEvent.branch]: {
                      current: true,
                      name: branchEvent.branch,
                      commit: '',
                      label: branchEvent.branch
                    }
                  }
                },
                isError: false
              };

              this.notificationService.sendToAppRelatedToAgentId(agent.id, responseNotification as any);
              console.log(formatLogMessage('info', 'GitHandler', `Sent git branch response notification`));

            } catch (error) {
              const errorResponse = {
                success: false,
                error: `Failed to create/checkout branch: ${error}`,
                type: 'branchResponse',
                id: requestId
              };

              this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });

              // Send error notification to app
              const errorNotification: GitBranchResponseNotification = {
                requestId: requestId,
                toolUseId: requestId,
                type: 'gitnotify',
                action: 'branchResult',
                content: {
                  success: false,
                  message: error instanceof Error ? error.message : String(error)
                },
                isError: true
              };

              this.notificationService.sendToAppRelatedToAgentId(agent.id, errorNotification as any);
            }
          })();
        }
        break;

      case 'gitLogs':
        {
          console.log(formatLogMessage('info', 'GitHandler', `Sent git logs request notification`));
          
          (async () => {
            try {
              const git = simpleGit(workingDir);
              const logs = await git.log();
              const formattedLogs = logs.all.map((commit: any) => ({
                hash: commit.hash,
                date: commit.date,
                message: commit.message,
                author_name: commit.author_name,
                author_email: commit.author_email
              }));
              
              const response = {
                success: true,
                data: formattedLogs,
                type: 'logsResponse',
                id: requestId,
                message: 'Git logs retrieved'
              };
              
              this.connectionManager.sendToConnection(agent.id, { ...response, clientId: agent.id });

              // Send response notification to app
              const responseNotification: GitLogsResponseNotification = {
                requestId: requestId,
                toolUseId: requestId,
                type: 'gitnotify',
                action: 'logsResult',
                content: {
                  all: formattedLogs,
                  total: formattedLogs.length,
                  latest: formattedLogs[0] || null
                },
                isError: false
              };

              this.notificationService.sendToAppRelatedToAgentId(agent.id, responseNotification as any);
              console.log(formatLogMessage('info', 'GitHandler', `Sent git logs response notification`));

            } catch (error) {
              const errorResponse = {
                success: false,
                error: `Failed to get git logs: ${error}`,
                type: 'logsResponse',
                id: requestId
              };

              this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });

              // Send error notification to app
              const errorNotification: GitLogsResponseNotification = {
                requestId: requestId,
                toolUseId: requestId,
                type: 'gitnotify',
                action: 'logsResult',
                content: {
                  success: false,
                  data: {
                    all: [],
                    total: 0
                  },
                  message: error instanceof Error ? error.message : String(error)
                },
                isError: true
              };

              this.notificationService.sendToAppRelatedToAgentId(agent.id, errorNotification as any);
            }
          })();
        }
        break;

      case 'Diff':
      case 'gitDiff' as any:
        {
          console.log(formatLogMessage('info', 'GitHandler', `Sent git diff request notification`));
          
          (async () => {
            try {
              const diffEvent = gitEvent as GitDiffEvent;
              const git = simpleGit(workingDir);
              let diff: string;
              
              if (diffEvent.commitHash) {
                diff = await git.diff([`${diffEvent.commitHash}^`, diffEvent.commitHash]);
              } else {
                diff = await git.diff();
              }
              
              const response = {
                success: true,
                data: diff,
                type: 'diffResponse',
                id: requestId,
                message: 'Git diff retrieved'
              };
              
              this.connectionManager.sendToConnection(agent.id, { ...response, clientId: agent.id });

              // Send response notification to app
              const responseNotification: GitDiffResponseNotification = {
                requestId: requestId,
                toolUseId: requestId,
                type: 'gitnotify',
                action: 'diffResult',
                content: response.data,
                isError: false
              };

              this.notificationService.sendToAppRelatedToAgentId(agent.id, responseNotification as any);
              console.log(formatLogMessage('info', 'GitHandler', `Sent git diff response notification`));

            } catch (error) {
              const errorResponse = {
                success: false,
                error: `Failed to get git diff: ${error}`,
                type: 'diffResponse',
                id: requestId
              };

              this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });

              // Send error notification to app
              const errorNotification: GitDiffResponseNotification = {
                requestId: requestId,
                toolUseId: requestId,
                type: 'gitnotify',
                action: 'diffResult',
                content: error instanceof Error ? error.message : String(error),
                isError: true
              };

              this.notificationService.sendToAppRelatedToAgentId(agent.id, errorNotification as any);
            }
          })();
        }
        break;

      // Handle non-typed clone as a permissive branch
      case 'Clone':
        {
          console.log(formatLogMessage('info', 'GitHandler', `Sent git clone request notification`));
          
          (async () => {
            try {
              const cloneEvent = gitEvent as any;
              if (!cloneEvent.url) {
                throw new Error('Repository URL is required');
              }

              const git = simpleGit();
              const clonePath = cloneEvent.path || './';
              await git.clone(cloneEvent.url, clonePath);
              
              const response = {
                success: true,
                data: { url: cloneEvent.url, path: clonePath },
                type: 'cloneResponse',
                id: requestId,
                message: `Repository cloned from: ${cloneEvent.url}`
              };
              
              this.connectionManager.sendToConnection(agent.id, { ...response, clientId: agent.id });

              // Send response notification to app
              const responseNotification: GitCloneResponseNotification = {
                requestId: requestId,
                toolUseId: requestId,
                type: 'gitnotify',
                action: 'cloneResult',
                content: `Repository cloned from: ${cloneEvent.url}`,
                isError: false
              };

              this.notificationService.sendToAppRelatedToAgentId(agent.id, responseNotification as any);
              console.log(formatLogMessage('info', 'GitHandler', `Sent git clone response notification`));

            } catch (error) {
              const errorResponse = {
                success: false,
                error: `Failed to clone repository: ${error}`,
                type: 'cloneResponse',
                id: requestId
              };

              this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });

              // Send error notification to app
              const errorNotification: GitCloneResponseNotification = {
                requestId: requestId,
                toolUseId: requestId,
                type: 'gitnotify',
                action: 'cloneResult',
                content: error instanceof Error ? error.message : String(error),
                isError: true
              };

              this.notificationService.sendToAppRelatedToAgentId(agent.id, errorNotification as any);
            }
          })();
        }
        break;

      default:
        const errorResponse = {
          success: false,
          error: `Unknown Git action: ${action}`,
          type: 'gitResponse',
          id: requestId
        };
        this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });
        break;
    }
  }

  // Helper method to get working directory
  private getWorkingDirectory(gitEvent: GitEvent): string {
    const eventWithPath = gitEvent as any;
    if (eventWithPath.path) {
      return path.resolve(eventWithPath.path);
    }
    return process.cwd();
  }
}