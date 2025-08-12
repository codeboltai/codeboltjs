import cbws from '../core/websocket';
import { 
    GitInitResponse, 
    GitPullResponse, 
    GitPushResponse, 
    GitStatusResponse, 
    AddResponse, 
    GitCommitResponse, 
    GitCheckoutResponse, 
    GitBranchResponse, 
    GitLogsResponse, 
    GitDiffResponse 
} from '../types/socketMessageTypes';


import { EventType , GitAction, GitResponseType} from '@codebolt/types';

/**
 * A service for interacting with Git operations via WebSocket messages.
 */
const gitService = {
    /**
     * Initializes a new Git repository at the given path.
     * @param {string} path - The file system path where the Git repository should be initialized.
     * @returns {Promise<GitInitResponse>} A promise that resolves with the response from the init event.
     */
    init: async (path: string): Promise<GitInitResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.GIT_EVENT,
                "action": GitAction.INIT,
                "path": path
            },
            GitResponseType.GIT_INIT_RESPONSE
        );
    },  
   
    /**
     * Pulls the latest changes from the remote repository to the local repository at the given path.
     * @param {string} path - The file system path of the local Git repository.
     * @returns {Promise<GitPullResponse>} A promise that resolves with the response from the pull event.
     */
    pull: async (): Promise<GitPullResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.GIT_EVENT,
                "action": GitAction.PULL
            },
            GitResponseType.PULL_RESPONSE
        );
    },
    /**
     * Pushes local repository changes to the remote repository at the given path.
     * @param {string} path - The file system path of the local Git repository.
     * @returns {Promise<GitPushResponse>} A promise that resolves with the response from the push event.
     */
    push: async (): Promise<GitPushResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.GIT_EVENT,
                "action": GitAction.PUSH,
               
            },
            GitResponseType.PUSH_RESPONSE
        );
    },
    /**
     * Retrieves the status of the local repository at the given path.
     * @param {string} path - The file system path of the local Git repository.
     * @returns {Promise<GitStatusResponse>} A promise that resolves with the response from the status event.
     */
    status: async (): Promise<GitStatusResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.GIT_EVENT,
                "action": GitAction.STATUS,
            },
            GitResponseType.GIT_STATUS_RESPONSE
        );
    },
    /**
     * Adds changes in the local repository to the staging area at the given path.
     * @param {string} path - The file system path of the local Git repository.
     * @returns {Promise<AddResponse>} A promise that resolves with the response from the add event.
     */
    addAll: async (): Promise<AddResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.GIT_EVENT,
                "action": GitAction.ADD,
            },
            GitResponseType.ADD_RESPONSE
        );
    },
    /**
     * Commits the staged changes in the local repository with the given commit message.
     * @param {string} message - The commit message to use for the commit.
     * @returns {Promise<GitCommitResponse>} A promise that resolves with the response from the commit event.
     */
    commit: async (message: string): Promise<GitCommitResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.GIT_EVENT,
                "action": GitAction.COMMIT,
                "message": message
            },
            GitResponseType.GIT_COMMIT_RESPONSE
        );
    },
    /**
     * Checks out a branch or commit in the local repository at the given path.
     * @param {string} path - The file system path of the local Git repository.
     * @param {string} branch - The name of the branch or commit to check out.
     * @returns {Promise<GitCheckoutResponse>} A promise that resolves with the response from the checkout event.
     */
    checkout: async ( branch: string): Promise<GitCheckoutResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.GIT_EVENT,
                "action": GitAction.CHECKOUT,
                "branch": branch
            },
            GitResponseType.GIT_CHECKOUT_RESPONSE
        );
    },
    /**
     * Creates a new branch in the local repository at the given path.
     * @param {string} path - The file system path of the local Git repository.
     * @param {string} branch - The name of the new branch to create.
     * @returns {Promise<GitBranchResponse>} A promise that resolves with the response from the branch event.
     */
    branch: async (branch: string): Promise<GitBranchResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.GIT_EVENT,
                "action": GitAction.GIT_BRANCH,
                "branch": branch,
            },
            GitResponseType.GIT_BRANCH_RESPONSE
        );
    },
    /**
     * Retrieves the commit logs for the local repository at the given path.
     * @param {string} path - The file system path of the local Git repository.
     * @returns {Promise<GitLogsResponse>} A promise that resolves with the response from the logs event.
     */
    logs: async (path: string): Promise<GitLogsResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.GIT_EVENT,
                "action": GitAction.GIT_LOGS,
                "path": path
            },
            GitResponseType.GIT_LOGS_RESPONSE
        );
    },
    /**
     * Retrieves the diff of changes for a specific commit in the local repository.
     * @param {string} commitHash - The hash of the commit to retrieve the diff for.
     * @param {string} path - The file system path of the local Git repository.
     * @returns {Promise<GitDiffResponse>} A promise that resolves with the response from the diff event.
     */
    diff: async (commitHash: string): Promise<GitDiffResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.GIT_EVENT,
                "action": GitAction.DIFF,
                "commitHash": commitHash
            },
            GitResponseType.DIFF_RESPONSE
        );
    }
};

export default gitService;
