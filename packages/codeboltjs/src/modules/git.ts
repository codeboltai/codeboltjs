import cbws from '../core/websocket';
import { EventType, GitAction, GitResponseType } from '@codebolt/types';
import { 
    GitInitSuccessResponse, GitInitErrorResponse,
    GitPullSuccessResponse, GitPullErrorResponse,
    GitPushSuccessResponse, GitPushErrorResponse,
    GitStatusSuccessResponse, GitStatusErrorResponse,
    GitAddSuccessResponse, GitAddErrorResponse,
    GitCommitSuccessResponse, GitCommitErrorResponse,
    GitCheckoutSuccessResponse, GitCheckoutErrorResponse,
    GitBranchSuccessResponse, GitBranchErrorResponse,
    GitLogsSuccessResponse, GitLogsErrorResponse,
    GitDiffSuccessResponse, GitDiffErrorResponse
} from '../types/libFunctionTypes';


/**
 * A service for interacting with Git operations via WebSocket messages.
 */

const gitService = {
    /**
     * Initializes a new Git repository at the given path.
     * @param {string} path - The file system path where the Git repository should be initialized.
     * @returns {Promise<GitInitSuccessResponse | GitInitErrorResponse>} A promise that resolves with the response from the init event.
     */
    init: async (path: string): Promise<GitInitSuccessResponse | GitInitErrorResponse> => {
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
     * Pulls the latest changes from the remote repository to the local repository.
     * @returns {Promise<GitPullSuccessResponse | GitPullErrorResponse>} A promise that resolves with the response from the pull event.
     */
    pull: async (): Promise<GitPullSuccessResponse | GitPullErrorResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.GIT_EVENT,
                "action": GitAction.PULL
            },
            GitResponseType.PULL_RESPONSE
        );
    },
    /**
     * Pushes local repository changes to the remote repository.
     * @returns {Promise<GitPushSuccessResponse | GitPushErrorResponse>} A promise that resolves with the response from the push event.
     */
    push: async (): Promise<GitPushSuccessResponse | GitPushErrorResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.GIT_EVENT,
                "action": GitAction.PUSH,
               
            },
            GitResponseType.PUSH_RESPONSE
        );
    },
    /**
     * Retrieves the status of the local repository.
     * @returns {Promise<GitStatusSuccessResponse | GitStatusErrorResponse>} A promise that resolves with the response from the status event.
     */
    status: async (): Promise<GitStatusSuccessResponse | GitStatusErrorResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.GIT_EVENT,
                "action": GitAction.STATUS,
            },
            GitResponseType.GIT_STATUS_RESPONSE
        );
    },
    /**
     * Adds all changes in the local repository to the staging area.
     * @returns {Promise<GitAddSuccessResponse | GitAddErrorResponse>} A promise that resolves with the response from the add event.
     */
    addAll: async (): Promise<GitAddSuccessResponse | GitAddErrorResponse> => {
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
     * @returns {Promise<GitCommitSuccessResponse | GitCommitErrorResponse>} A promise that resolves with the response from the commit event.
     */
    commit: async (message: string): Promise<GitCommitSuccessResponse | GitCommitErrorResponse> => {
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
     * Checks out a branch or commit in the local repository.
     * @param {string} branch - The name of the branch or commit to check out.
     * @returns {Promise<GitCheckoutSuccessResponse | GitCheckoutErrorResponse>} A promise that resolves with the response from the checkout event.
     */
    checkout: async ( branch: string): Promise<GitCheckoutSuccessResponse | GitCheckoutErrorResponse> => {
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
     * Creates a new branch in the local repository.
     * @param {string} branch - The name of the new branch to create.
     * @returns {Promise<GitBranchSuccessResponse | GitBranchErrorResponse>} A promise that resolves with the response from the branch event.
     */
    branch: async (branch: string): Promise<GitBranchSuccessResponse | GitBranchErrorResponse> => {
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
     * Retrieves the commit logs for the local repository.
     * @param {string} path - The file system path of the local Git repository.
     * @returns {Promise<GitLogsSuccessResponse | GitLogsErrorResponse>} A promise that resolves with the response from the logs event.
     */
    logs: async (path: string): Promise<GitLogsSuccessResponse | GitLogsErrorResponse> => {
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
     * @returns {Promise<GitDiffSuccessResponse | GitDiffErrorResponse>} A promise that resolves with the response from the diff event.
     */
    diff: async (commitHash: string): Promise<GitDiffSuccessResponse | GitDiffErrorResponse> => {
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
