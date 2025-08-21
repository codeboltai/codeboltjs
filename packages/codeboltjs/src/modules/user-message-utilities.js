"use strict";
/**
 * @fileoverview User Message Utilities for CodeBolt
 * @description Provides utilities for accessing current user message and context
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.userMessageUtilities = void 0;
const user_message_manager_1 = require("./user-message-manager");
/**
 * User message utilities for accessing current user message and context
 */
exports.userMessageUtilities = {
    /**
     * Get the current user message object
     * @returns Current UserMessage or undefined
     */
    getCurrent: () => user_message_manager_1.userMessageManager.getMessage(),
    /**
     * Get the user message text content
     * @returns Message text string
     */
    getText: () => user_message_manager_1.userMessageManager.getMessageText(),
    /**
     * Get mentioned MCPs from current message
     * @returns Array of MCP tools
     */
    getMentionedMCPs: () => user_message_manager_1.userMessageManager.getMentionedMCPs(),
    /**
     * Get mentioned files from current message
     * @returns Array of file paths
     */
    getMentionedFiles: () => user_message_manager_1.userMessageManager.getMentionedFiles(),
    /**
     * Get mentioned folders from current message
     * @returns Array of folder paths
     */
    getMentionedFolders: () => user_message_manager_1.userMessageManager.getMentionedFolders(),
    /**
     * Get mentioned agents from current message
     * @returns Array of agent objects
     */
    getMentionedAgents: () => user_message_manager_1.userMessageManager.getMentionedAgents(),
    /**
     * Get remix prompt from current message
     * @returns Remix prompt string or undefined
     */
    getRemixPrompt: () => user_message_manager_1.userMessageManager.getRemixPrompt(),
    /**
     * Get uploaded images from current message
     * @returns Array of image objects
     */
    getUploadedImages: () => user_message_manager_1.userMessageManager.getUploadedImages(),
    /**
     * Get current file path
     * @returns Current file path or undefined
     */
    getCurrentFile: () => user_message_manager_1.userMessageManager.getCurrentFile(),
    /**
     * Get text selection from current message
     * @returns Selected text or undefined
     */
    getSelection: () => user_message_manager_1.userMessageManager.getSelection(),
    /**
     * Get message ID
     * @returns Message ID or undefined
     */
    getMessageId: () => user_message_manager_1.userMessageManager.getMessageId(),
    /**
     * Get thread ID
     * @returns Thread ID or undefined
     */
    getThreadId: () => user_message_manager_1.userMessageManager.getThreadId(),
    /**
     * Get processing configuration
     * @returns Processing configuration object
     */
    getProcessingConfig: () => user_message_manager_1.userMessageManager.getConfig(),
    /**
     * Check if a processing type is enabled
     * @param type Processing type to check
     * @returns Whether the processing type is enabled
     */
    isProcessingEnabled: (type) => user_message_manager_1.userMessageManager.isProcessingEnabled(type),
    /**
     * Set session data
     * @param key Session data key
     * @param value Session data value
     */
    setSessionData: (key, value) => user_message_manager_1.userMessageManager.setSessionData(key, value),
    /**
     * Get session data
     * @param key Session data key
     * @returns Session data value
     */
    getSessionData: (key) => user_message_manager_1.userMessageManager.getSessionData(key),
    /**
     * Get message timestamp
     * @returns Timestamp when message was received
     */
    getTimestamp: () => user_message_manager_1.userMessageManager.getTimestamp(),
    /**
     * Check if there's a current message
     * @returns Whether there's a current message
     */
    hasMessage: () => user_message_manager_1.userMessageManager.hasMessage(),
    /**
     * Update processing configuration
     * @param config New processing configuration
     */
    updateProcessingConfig: (config) => user_message_manager_1.userMessageManager.updateConfig(config),
    /**
     * Clear current user message
     */
    clear: () => user_message_manager_1.userMessageManager.clear()
};
