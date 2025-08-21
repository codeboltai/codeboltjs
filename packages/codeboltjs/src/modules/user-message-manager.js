"use strict";
/**
 * @fileoverview Global User Message Manager for CodeBolt
 * @description Automatically manages the current user message for agent integration
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.userMessageManager = void 0;
exports.getCurrentUserMessage = getCurrentUserMessage;
exports.getUserMessageText = getUserMessageText;
exports.getUserProcessingConfig = getUserProcessingConfig;
exports.getMentionedMCPs = getMentionedMCPs;
exports.getMentionedFiles = getMentionedFiles;
exports.getMentionedFolders = getMentionedFolders;
exports.getMentionedAgents = getMentionedAgents;
exports.getRemixPrompt = getRemixPrompt;
exports.getUploadedImages = getUploadedImages;
exports.getCurrentFile = getCurrentFile;
exports.getSelection = getSelection;
exports.getMessageId = getMessageId;
exports.getThreadId = getThreadId;
exports.isUserProcessingEnabled = isUserProcessingEnabled;
exports.setUserSessionData = setUserSessionData;
exports.getUserSessionData = getUserSessionData;
exports.clearUserMessage = clearUserMessage;
exports.getUserMessageTimestamp = getUserMessageTimestamp;
exports.updateUserProcessingConfig = updateUserProcessingConfig;
exports.hasCurrentUserMessage = hasCurrentUserMessage;
/**
 * Global user message manager
 */
class UserMessageManager {
    constructor() {
        this.state = {};
    }
    /**
     * Save user message (called automatically by onMessage)
     *
     * @param message - User message from onMessage
     * @param config - Optional processing configuration
     */
    saveMessage(message, config) {
        var _a, _b, _c, _d;
        this.state.currentMessage = message;
        this.state.timestamp = new Date().toISOString();
        // Auto-detect configuration from message if not explicitly provided
        if (config) {
            this.state.userConfig = { ...config };
        }
        else {
            this.state.userConfig = {
                processMentionedMCPs: ((_a = message.mentionedMCPs) === null || _a === void 0 ? void 0 : _a.length) > 0,
                processRemixPrompt: !!message.remixPrompt,
                processMentionedFiles: (((_b = message.mentionedFiles) === null || _b === void 0 ? void 0 : _b.length) > 0) || (((_c = message.mentionedFullPaths) === null || _c === void 0 ? void 0 : _c.length) > 0),
                processMentionedAgents: ((_d = message.mentionedAgents) === null || _d === void 0 ? void 0 : _d.length) > 0
            };
        }
    }
    /**
     * Get current user message
     *
     * @returns Current user message or undefined
     */
    getMessage() {
        return this.state.currentMessage;
    }
    /**
     * Get user processing configuration
     *
     * @returns User processing configuration
     */
    getConfig() {
        return this.state.userConfig || {};
    }
    /**
     * Get mentioned MCPs from current message
     *
     * @returns Array of mentioned MCP tools
     */
    getMentionedMCPs() {
        var _a;
        return ((_a = this.state.currentMessage) === null || _a === void 0 ? void 0 : _a.mentionedMCPs) || [];
    }
    /**
     * Get mentioned files from current message
     *
     * @returns Array of mentioned file paths
     */
    getMentionedFiles() {
        var _a, _b;
        const files = ((_a = this.state.currentMessage) === null || _a === void 0 ? void 0 : _a.mentionedFiles) || [];
        const fullPaths = ((_b = this.state.currentMessage) === null || _b === void 0 ? void 0 : _b.mentionedFullPaths) || [];
        return [...files, ...fullPaths];
    }
    /**
     * Get mentioned folders from current message
     *
     * @returns Array of mentioned folder paths
     */
    getMentionedFolders() {
        var _a;
        return ((_a = this.state.currentMessage) === null || _a === void 0 ? void 0 : _a.mentionedFolders) || [];
    }
    /**
     * Get mentioned agents from current message
     *
     * @returns Array of mentioned agents
     */
    getMentionedAgents() {
        var _a;
        return ((_a = this.state.currentMessage) === null || _a === void 0 ? void 0 : _a.mentionedAgents) || [];
    }
    /**
     * Get remix prompt from current message
     *
     * @returns Remix prompt string or undefined
     */
    getRemixPrompt() {
        var _a;
        return (_a = this.state.currentMessage) === null || _a === void 0 ? void 0 : _a.remixPrompt;
    }
    /**
     * Get uploaded images from current message
     *
     * @returns Array of uploaded images
     */
    getUploadedImages() {
        var _a;
        return ((_a = this.state.currentMessage) === null || _a === void 0 ? void 0 : _a.uploadedImages) || [];
    }
    /**
     * Get current file from current message
     *
     * @returns Current file path or undefined
     */
    getCurrentFile() {
        var _a;
        return (_a = this.state.currentMessage) === null || _a === void 0 ? void 0 : _a.currentFile;
    }
    /**
     * Get text selection from current message
     *
     * @returns Text selection or undefined
     */
    getSelection() {
        var _a;
        return (_a = this.state.currentMessage) === null || _a === void 0 ? void 0 : _a.selection;
    }
    /**
     * Get message ID
     *
     * @returns Message ID or undefined
     */
    getMessageId() {
        var _a;
        return (_a = this.state.currentMessage) === null || _a === void 0 ? void 0 : _a.messageId;
    }
    /**
     * Get thread ID
     *
     * @returns Thread ID or undefined
     */
    getThreadId() {
        var _a;
        return (_a = this.state.currentMessage) === null || _a === void 0 ? void 0 : _a.threadId;
    }
    /**
     * Check if a specific processing type is enabled
     *
     * @param type - Processing type to check
     * @returns Whether the processing type is enabled
     */
    isProcessingEnabled(type) {
        var _a;
        const value = (_a = this.state.userConfig) === null || _a === void 0 ? void 0 : _a[type];
        if (typeof value === 'function') {
            return true; // If a function is provided, consider it enabled
        }
        return Boolean(value);
    }
    /**
     * Set session data
     *
     * @param key - Session data key
     * @param value - Session data value
     */
    setSessionData(key, value) {
        if (!this.state.sessionData) {
            this.state.sessionData = {};
        }
        this.state.sessionData[key] = value;
    }
    /**
     * Get session data
     *
     * @param key - Session data key
     * @returns Session data value
     */
    getSessionData(key) {
        var _a;
        return (_a = this.state.sessionData) === null || _a === void 0 ? void 0 : _a[key];
    }
    /**
     * Clear all user message state
     */
    clear() {
        this.state = {};
    }
    /**
     * Get current message text content
     *
     * @returns User message text
     */
    getMessageText() {
        var _a;
        return ((_a = this.state.currentMessage) === null || _a === void 0 ? void 0 : _a.userMessage) || '';
    }
    /**
     * Get message timestamp
     *
     * @returns Timestamp when message was saved
     */
    getTimestamp() {
        return this.state.timestamp;
    }
    /**
     * Update processing configuration
     *
     * @param config - New processing configuration
     */
    updateConfig(config) {
        this.state.userConfig = {
            ...this.state.userConfig,
            ...config
        };
    }
    /**
     * Check if there's a current message
     *
     * @returns Whether there's a current message
     */
    hasMessage() {
        return !!this.state.currentMessage;
    }
}
// Global singleton instance
const userMessageManager = new UserMessageManager();
exports.userMessageManager = userMessageManager;
// Export utility functions for public API
function getCurrentUserMessage() {
    return userMessageManager.getMessage();
}
function getUserMessageText() {
    return userMessageManager.getMessageText();
}
function getUserProcessingConfig() {
    return userMessageManager.getConfig();
}
function getMentionedMCPs() {
    return userMessageManager.getMentionedMCPs();
}
function getMentionedFiles() {
    return userMessageManager.getMentionedFiles();
}
function getMentionedFolders() {
    return userMessageManager.getMentionedFolders();
}
function getMentionedAgents() {
    return userMessageManager.getMentionedAgents();
}
function getRemixPrompt() {
    return userMessageManager.getRemixPrompt();
}
function getUploadedImages() {
    return userMessageManager.getUploadedImages();
}
function getCurrentFile() {
    return userMessageManager.getCurrentFile();
}
function getSelection() {
    return userMessageManager.getSelection();
}
function getMessageId() {
    return userMessageManager.getMessageId();
}
function getThreadId() {
    return userMessageManager.getThreadId();
}
function isUserProcessingEnabled(type) {
    return userMessageManager.isProcessingEnabled(type);
}
function setUserSessionData(key, value) {
    userMessageManager.setSessionData(key, value);
}
function getUserSessionData(key) {
    return userMessageManager.getSessionData(key);
}
function clearUserMessage() {
    userMessageManager.clear();
}
function getUserMessageTimestamp() {
    return userMessageManager.getTimestamp();
}
function updateUserProcessingConfig(config) {
    userMessageManager.updateConfig(config);
}
function hasCurrentUserMessage() {
    return userMessageManager.hasMessage();
}
