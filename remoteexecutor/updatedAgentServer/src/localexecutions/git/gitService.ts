import simpleGit, { SimpleGit, StatusResult, LogResult, DiffResult } from 'simple-git';
import { logger } from '../../main/utils/logger';

/**
 * Git Service for remote executor
 * Provides git operations using simple-git package
 */
export class GitService {
    private git: SimpleGit;
    private projectPath: string;

    constructor(projectPath?: string) {
        this.projectPath = projectPath || process.cwd();
        this.git = simpleGit(this.projectPath);
    }

    /**
     * Initialize a new git repository
     */
    async init(): Promise<{ success: boolean; message: string }> {
        try {
            await this.git.init();
            return { success: true, message: 'Git repository initialized successfully' };
        } catch (error) {
            logger.error('[GitService] Error initializing git repository:', error);
            throw error;
        }
    }

    /**
     * Add all files to staging area
     */
    async add(): Promise<{ success: boolean; message: string }> {
        try {
            await this.git.add('.');
            return { success: true, message: 'Files added to staging area' };
        } catch (error) {
            logger.error('[GitService] Error adding files:', error);
            throw error;
        }
    }

    /**
     * Commit staged changes
     */
    async commit(message: string): Promise<{ success: boolean; message: string; commitHash?: string }> {
        try {
            const result = await this.git.commit(message);
            return {
                success: true,
                message: `Committed with message: ${message}`,
                commitHash: result.commit
            };
        } catch (error) {
            logger.error('[GitService] Error committing:', error);
            throw error;
        }
    }

    /**
     * Push changes to remote
     */
    async push(): Promise<{ success: boolean; message: string }> {
        try {
            await this.git.push();
            return { success: true, message: 'Changes pushed to remote repository' };
        } catch (error) {
            logger.error('[GitService] Error pushing:', error);
            throw error;
        }
    }

    /**
     * Pull changes from remote
     */
    async pull(): Promise<{ success: boolean; message: string }> {
        try {
            await this.git.pull();
            return { success: true, message: 'Changes pulled from remote repository' };
        } catch (error) {
            logger.error('[GitService] Error pulling:', error);
            throw error;
        }
    }

    /**
     * Checkout a branch
     */
    async checkout(branch: string): Promise<{ success: boolean; message: string; branch: string }> {
        try {
            await this.git.checkout(branch);
            return { success: true, message: `Checked out to branch: ${branch}`, branch };
        } catch (error) {
            logger.error('[GitService] Error checking out branch:', error);
            throw error;
        }
    }

    /**
     * Create a new branch
     */
    async branch(branchName: string): Promise<{ success: boolean; message: string; branch: string }> {
        try {
            await this.git.checkoutLocalBranch(branchName);
            return { success: true, message: `Created branch: ${branchName}`, branch: branchName };
        } catch (error) {
            logger.error('[GitService] Error creating branch:', error);
            throw error;
        }
    }

    /**
     * Get commit logs
     */
    async logs(): Promise<{ success: boolean; message: string; data: LogResult }> {
        try {
            const logs = await this.git.log();
            return { success: true, message: 'Git logs retrieved successfully', data: logs };
        } catch (error) {
            logger.error('[GitService] Error getting logs:', error);
            throw error;
        }
    }

    /**
     * Get diff for a specific commit
     */
    async diff(commitHash?: string): Promise<{ success: boolean; message: string; data: string }> {
        try {
            const diffResult = commitHash
                ? await this.git.diff([commitHash])
                : await this.git.diff();
            return { success: true, message: 'Git diff retrieved successfully', data: diffResult };
        } catch (error) {
            logger.error('[GitService] Error getting diff:', error);
            throw error;
        }
    }

    /**
     * Get repository status
     */
    async status(): Promise<{ success: boolean; message: string; data: StatusResult }> {
        try {
            const status = await this.git.status();
            return { success: true, message: 'Git status retrieved successfully', data: status };
        } catch (error) {
            logger.error('[GitService] Error getting status:', error);
            throw error;
        }
    }

    /**
     * Clone a repository
     */
    async clone(url: string, targetPath?: string): Promise<{ success: boolean; message: string; url: string }> {
        try {
            const clonePath = targetPath || this.projectPath;
            await simpleGit().clone(url, clonePath);
            return { success: true, message: `Repository cloned from: ${url}`, url };
        } catch (error) {
            logger.error('[GitService] Error cloning repository:', error);
            throw error;
        }
    }
}

// Export singleton instance for convenience
export const gitService = new GitService();
