import { GitInitResponse, GitPullResponse, GitPushResponse, GitStatusResponse, AddResponse, GitCommitResponse, GitCheckoutResponse, GitBranchResponse, GitLogsResponse, GitDiffResponse } from '@codebolt/types/sdk';
/**
 * A service for interacting with Git operations via WebSocket messages.
 */
declare const gitService: {
    /**
     * Initializes a new Git repository at the given path.
     * @param {string} path - The file system path where the Git repository should be initialized.
     * @returns {Promise<GitInitResponse>} A promise that resolves with the response from the init event.
     */
    init: (path: string) => Promise<GitInitResponse>;
    /**
     * Pulls the latest changes from the remote repository to the local repository at the given path.
     * @param {string} path - The file system path of the local Git repository.
     * @returns {Promise<GitPullResponse>} A promise that resolves with the response from the pull event.
     */
    pull: () => Promise<GitPullResponse>;
    /**
     * Pushes local repository changes to the remote repository at the given path.
     * @param {string} path - The file system path of the local Git repository.
     * @returns {Promise<GitPushResponse>} A promise that resolves with the response from the push event.
     */
    push: () => Promise<GitPushResponse>;
    /**
     * Retrieves the status of the local repository at the given path.
     * @param {string} path - The file system path of the local Git repository.
     * @returns {Promise<GitStatusResponse>} A promise that resolves with the response from the status event.
     */
    status: () => Promise<GitStatusResponse>;
    /**
     * Adds changes in the local repository to the staging area at the given path.
     * @param {string} path - The file system path of the local Git repository.
     * @returns {Promise<AddResponse>} A promise that resolves with the response from the add event.
     */
    addAll: () => Promise<AddResponse>;
    /**
     * Commits the staged changes in the local repository with the given commit message.
     * @param {string} message - The commit message to use for the commit.
     * @returns {Promise<GitCommitResponse>} A promise that resolves with the response from the commit event.
     */
    commit: (message: string) => Promise<GitCommitResponse>;
    /**
     * Checks out a branch or commit in the local repository at the given path.
     * @param {string} path - The file system path of the local Git repository.
     * @param {string} branch - The name of the branch or commit to check out.
     * @returns {Promise<GitCheckoutResponse>} A promise that resolves with the response from the checkout event.
     */
    checkout: (branch: string) => Promise<GitCheckoutResponse>;
    /**
     * Creates a new branch in the local repository at the given path.
     * @param {string} path - The file system path of the local Git repository.
     * @param {string} branch - The name of the new branch to create.
     * @returns {Promise<GitBranchResponse>} A promise that resolves with the response from the branch event.
     */
    branch: (branch: string) => Promise<GitBranchResponse>;
    /**
     * Retrieves the commit logs for the local repository at the given path.
     * @param {string} path - The file system path of the local Git repository.
     * @returns {Promise<GitLogsResponse>} A promise that resolves with the response from the logs event.
     */
    logs: (path: string) => Promise<GitLogsResponse>;
    /**
     * Retrieves the diff of changes for a specific commit in the local repository.
     * @param {string} commitHash - The hash of the commit to retrieve the diff for.
     * @param {string} path - The file system path of the local Git repository.
     * @returns {Promise<GitDiffResponse>} A promise that resolves with the response from the diff event.
     */
    diff: (commitHash: string) => Promise<GitDiffResponse>;
};
export default gitService;
