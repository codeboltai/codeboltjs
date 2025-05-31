import cbws from '../core/websocket';

/**
 * A service for interacting with Git operations via WebSocket messages.
 */
const gitService = {
    /**
     * Initializes a new Git repository at the given path.
     * @param {string} path - The file system path where the Git repository should be initialized.
     * @returns {Promise<any>} A promise that resolves with the response from the init event.
     */
    init: async (path: string): Promise<any> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "gitEvent",
                "action": "Init",
                "path": path
            },
            "gitInitResponse"
        );
    },
    /**
     * Clones a Git repository from the given URL to the specified path.
     * @param {string} url - The URL of the Git repository to clone.
     * @param {string} path - The file system path where the repository should be cloned to.
     * @returns {Promise<any>} A promise that resolves with the response from the clone event.
     */
    clone: async (url: string, path: string): Promise<any> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "gitEvent",
                "action": "Clone",
                "url": url,
                "path": path
            },
            "CloneResponse"
        );
    },
    /**
     * Pulls the latest changes from the remote repository to the local repository at the given path.
     * @param {string} path - The file system path of the local Git repository.
     * @returns {Promise<any>} A promise that resolves with the response from the pull event.
     */
    pull: async (path: string): Promise<any> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "gitEvent",
                "action": "Pull",
                "path": path
            },
            "PullResponse"
        );
    },
    /**
     * Pushes local repository changes to the remote repository at the given path.
     * @param {string} path - The file system path of the local Git repository.
     * @returns {Promise<any>} A promise that resolves with the response from the push event.
     */
    push: async (path: string): Promise<any> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "gitEvent",
                "action": "Push",
                "path": path
            },
            "PushResponse"
        );
    },
    /**
     * Retrieves the status of the local repository at the given path.
     * @param {string} path - The file system path of the local Git repository.
     * @returns {Promise<any>} A promise that resolves with the response from the status event.
     */
    status: async (path: string): Promise<any> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "gitEvent",
                "action": "Status",
                "path": path
            },
            "gitStatusResponse"
        );
    },
    /**
     * Adds changes in the local repository to the staging area at the given path.
     * @param {string} path - The file system path of the local Git repository.
     * @returns {Promise<any>} A promise that resolves with the response from the add event.
     */
    add: async (path: string): Promise<any> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "gitEvent",
                "action": "Add",
                "path": path
            },
            "AddResponse"
        );
    },
    /**
     * Commits the staged changes in the local repository with the given commit message.
     * @param {string} message - The commit message to use for the commit.
     * @returns {Promise<any>} A promise that resolves with the response from the commit event.
     */
    commit: async (message: string): Promise<any> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "gitEvent",
                "action": "Commit",
                "message": message
            },
            "gitCommitResponse"
        );
    },
    /**
     * Checks out a branch or commit in the local repository at the given path.
     * @param {string} path - The file system path of the local Git repository.
     * @param {string} branch - The name of the branch or commit to check out.
     * @returns {Promise<any>} A promise that resolves with the response from the checkout event.
     */
    checkout: async (path: string, branch: string): Promise<any> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "gitEvent",
                "action": "Checkout",
                "path": path,
                "branch": branch
            },
            "CheckoutResponse"
        );
    },
    /**
     * Creates a new branch in the local repository at the given path.
     * @param {string} path - The file system path of the local Git repository.
     * @param {string} branch - The name of the new branch to create.
     * @returns {Promise<any>} A promise that resolves with the response from the branch event.
     */
    branch: async (path: string, branch: string): Promise<any> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "gitEvent",
                "action": "Branch",
                "path": path,
                "branch": branch
            },
            "BranchResponse"
        );
    },
    /**
     * Retrieves the commit logs for the local repository at the given path.
     * @param {string} path - The file system path of the local Git repository.
     * @returns {Promise<any>} A promise that resolves with the response from the logs event.
     */
    logs: async (path: string): Promise<any> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "gitEvent",
                "action": "Logs",
                "path": path
            },
            "gitLogsResponse"
        );
    },
    /**
     * Retrieves the diff of changes for a specific commit in the local repository.
     * @param {string} commitHash - The hash of the commit to retrieve the diff for.
     * @param {string} path - The file system path of the local Git repository.
     * @returns {Promise<any>} A promise that resolves with the response from the diff event.
     */
    diff: async (commitHash: string, path: string): Promise<any> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "gitEvent",
                "action": "Diff",
                "path": path,
                "commitHash": commitHash
            },
            "DiffResponse"
        );
    }
};

export default gitService;
