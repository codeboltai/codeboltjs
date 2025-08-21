"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const websocket_1 = __importDefault(require("../core/websocket"));
const enum_1 = require("@codebolt/types/enum");
/**
 * A service for interacting with Git operations via WebSocket messages.
 */
const gitService = {
    /**
     * Initializes a new Git repository at the given path.
     * @param {string} path - The file system path where the Git repository should be initialized.
     * @returns {Promise<GitInitResponse>} A promise that resolves with the response from the init event.
     */
    init: async (path) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.GIT_EVENT,
            "action": enum_1.GitAction.INIT,
            "path": path
        }, enum_1.GitResponseType.GIT_INIT_RESPONSE);
    },
    /**
     * Pulls the latest changes from the remote repository to the local repository at the given path.
     * @param {string} path - The file system path of the local Git repository.
     * @returns {Promise<GitPullResponse>} A promise that resolves with the response from the pull event.
     */
    pull: async () => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.GIT_EVENT,
            "action": enum_1.GitAction.PULL
        }, enum_1.GitResponseType.PULL_RESPONSE);
    },
    /**
     * Pushes local repository changes to the remote repository at the given path.
     * @param {string} path - The file system path of the local Git repository.
     * @returns {Promise<GitPushResponse>} A promise that resolves with the response from the push event.
     */
    push: async () => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.GIT_EVENT,
            "action": enum_1.GitAction.PUSH,
        }, enum_1.GitResponseType.PUSH_RESPONSE);
    },
    /**
     * Retrieves the status of the local repository at the given path.
     * @param {string} path - The file system path of the local Git repository.
     * @returns {Promise<GitStatusResponse>} A promise that resolves with the response from the status event.
     */
    status: async () => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.GIT_EVENT,
            "action": enum_1.GitAction.STATUS,
        }, enum_1.GitResponseType.GIT_STATUS_RESPONSE);
    },
    /**
     * Adds changes in the local repository to the staging area at the given path.
     * @param {string} path - The file system path of the local Git repository.
     * @returns {Promise<AddResponse>} A promise that resolves with the response from the add event.
     */
    addAll: async () => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.GIT_EVENT,
            "action": enum_1.GitAction.ADD,
        }, enum_1.GitResponseType.ADD_RESPONSE);
    },
    /**
     * Commits the staged changes in the local repository with the given commit message.
     * @param {string} message - The commit message to use for the commit.
     * @returns {Promise<GitCommitResponse>} A promise that resolves with the response from the commit event.
     */
    commit: async (message) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.GIT_EVENT,
            "action": enum_1.GitAction.COMMIT,
            "message": message
        }, enum_1.GitResponseType.GIT_COMMIT_RESPONSE);
    },
    /**
     * Checks out a branch or commit in the local repository at the given path.
     * @param {string} path - The file system path of the local Git repository.
     * @param {string} branch - The name of the branch or commit to check out.
     * @returns {Promise<GitCheckoutResponse>} A promise that resolves with the response from the checkout event.
     */
    checkout: async (branch) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.GIT_EVENT,
            "action": enum_1.GitAction.CHECKOUT,
            "branch": branch
        }, enum_1.GitResponseType.GIT_CHECKOUT_RESPONSE);
    },
    /**
     * Creates a new branch in the local repository at the given path.
     * @param {string} path - The file system path of the local Git repository.
     * @param {string} branch - The name of the new branch to create.
     * @returns {Promise<GitBranchResponse>} A promise that resolves with the response from the branch event.
     */
    branch: async (branch) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.GIT_EVENT,
            "action": enum_1.GitAction.GIT_BRANCH,
            "branch": branch,
        }, enum_1.GitResponseType.GIT_BRANCH_RESPONSE);
    },
    /**
     * Retrieves the commit logs for the local repository at the given path.
     * @param {string} path - The file system path of the local Git repository.
     * @returns {Promise<GitLogsResponse>} A promise that resolves with the response from the logs event.
     */
    logs: async (path) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.GIT_EVENT,
            "action": enum_1.GitAction.GIT_LOGS,
            "path": path
        }, enum_1.GitResponseType.GIT_LOGS_RESPONSE);
    },
    /**
     * Retrieves the diff of changes for a specific commit in the local repository.
     * @param {string} commitHash - The hash of the commit to retrieve the diff for.
     * @param {string} path - The file system path of the local Git repository.
     * @returns {Promise<GitDiffResponse>} A promise that resolves with the response from the diff event.
     */
    diff: async (commitHash) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.GIT_EVENT,
            "action": enum_1.GitAction.DIFF,
            "commitHash": commitHash
        }, enum_1.GitResponseType.DIFF_RESPONSE);
    }
};
exports.default = gitService;
