/**
 * Git Action Utility - Performs Git operations
 */

import { spawn } from 'node:child_process';

/**
 * Parameters for the GitAction utility
 */
export interface GitActionParams {
    /**
     * The git action to perform (init, add, commit, push, pull, checkout, branch, logs, diff, status, clone)
     */
    action: string;

    /**
     * Commit message (required for commit action)
     */
    message?: string;

    /**
     * Branch name (required for checkout and branch actions)
     */
    branch?: string;

    /**
     * Repository URL (required for clone action)
     */
    url?: string;

    /**
     * Commit hash (optional for diff action)
     */
    commitHash?: string;
}

/**
 * Executes a git action with the provided parameters
 */
export async function executeGitAction(
    params: GitActionParams
): Promise<{ llmContent: string; returnDisplay: string; error?: any }> {
    try {
        // Map action to git command
        let command = `git ${params.action}`;
        
        // Add action-specific arguments
        switch (params.action) {
            case 'commit':
                if (!params.message) {
                    return {
                        llmContent: '',
                        returnDisplay: '',
                        error: {
                            type: 'INVALID_PARAMS',
                            message: 'Commit message is required for commit action'
                        }
                    };
                }
                command += ` -m "${params.message}"`;
                break;
            case 'checkout':
            case 'branch':
                if (!params.branch) {
                    return {
                        llmContent: '',
                        returnDisplay: '',
                        error: {
                            type: 'INVALID_PARAMS',
                            message: `Branch name is required for ${params.action} action`
                        }
                    };
                }
                command += ` ${params.branch}`;
                break;
            case 'clone':
                if (!params.url) {
                    return {
                        llmContent: '',
                        returnDisplay: '',
                        error: {
                            type: 'INVALID_PARAMS',
                            message: 'Repository URL is required for clone action'
                        }
                    };
                }
                command += ` ${params.url}`;
                break;
            case 'diff':
                if (params.commitHash) {
                    command += ` ${params.commitHash}`;
                }
                break;
        }

        // Execute the git command
        return new Promise((resolve) => {
            const child = spawn(command, [], {
                cwd: process.cwd(),
                env: process.env,
                stdio: ['pipe', 'pipe', 'pipe'],
                shell: true
            });
            
            let stdout = '';
            let stderr = '';
            
            child.stdout?.on('data', (data) => {
                stdout += data.toString();
            });
            
            child.stderr?.on('data', (data) => {
                stderr += data.toString();
            });
            
            child.on('close', (code) => {
                if (code === 0) {
                    const message = stdout || `Git ${params.action} completed successfully`;
                    resolve({
                        llmContent: message,
                        returnDisplay: message
                    });
                } else {
                    resolve({
                        llmContent: '',
                        returnDisplay: '',
                        error: {
                            type: 'EXECUTION_FAILED',
                            message: stderr || `Git ${params.action} failed with exit code ${code}`
                        }
                    });
                }
            });
            
            child.on('error', (error) => {
                resolve({
                    llmContent: '',
                    returnDisplay: '',
                    error: {
                        type: 'EXECUTION_FAILED',
                        message: `Failed to execute git ${params.action}: ${error.message}`
                    }
                });
            });
        });
    } catch (error) {
        return {
            llmContent: '',
            returnDisplay: '',
            error: {
                type: 'EXECUTION_FAILED',
                message: error instanceof Error ? error.message : 'Unknown error occurred during git operation'
            }
        };
    }
}