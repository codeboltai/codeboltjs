/**
 * @fileoverview User Message Utilities for CodeBolt
 * @description Provides utilities for accessing current user message and context
 */

import { userMessageManager } from './user-message-manager';

/**
 * User message utilities for accessing current user message and context
 */
export const userMessageUtilities = {
    /**
     * Get the current user message object
     * @returns Current UserMessage or undefined
     */
    getCurrent: () => userMessageManager.getMessage(),
    
    /**
     * Get the user message text content
     * @returns Message text string
     */
    getText: () => userMessageManager.getMessageText(),
    
    /**
     * Get mentioned MCPs from current message
     * @returns Array of MCP tools
     */
    getMentionedMCPs: () => userMessageManager.getMentionedMCPs(),
    
    /**
     * Get mentioned files from current message
     * @returns Array of file paths
     */
    getMentionedFiles: () => userMessageManager.getMentionedFiles(),
    
    /**
     * Get mentioned folders from current message
     * @returns Array of folder paths
     */
    getMentionedFolders: () => userMessageManager.getMentionedFolders(),
    
    /**
     * Get mentioned agents from current message
     * @returns Array of agent objects
     */
    getMentionedAgents: () => userMessageManager.getMentionedAgents(),
    
    /**
     * Get remix prompt from current message
     * @returns Remix prompt string or undefined
     */
    getRemixPrompt: () => userMessageManager.getRemixPrompt(),
    
    /**
     * Get uploaded images from current message
     * @returns Array of image objects
     */
    getUploadedImages: () => userMessageManager.getUploadedImages(),
    
    /**
     * Get current file path
     * @returns Current file path or undefined
     */
    getCurrentFile: () => userMessageManager.getCurrentFile(),
    
    /**
     * Get text selection from current message
     * @returns Selected text or undefined
     */
    getSelection: () => userMessageManager.getSelection(),
    
    /**
     * Get message ID
     * @returns Message ID or undefined
     */
    getMessageId: () => userMessageManager.getMessageId(),
    
    /**
     * Get thread ID
     * @returns Thread ID or undefined
     */
    getThreadId: () => userMessageManager.getThreadId(),
    
    /**
     * Get processing configuration
     * @returns Processing configuration object
     */
    getProcessingConfig: () => userMessageManager.getConfig(),
    
    /**
     * Check if a processing type is enabled
     * @param type Processing type to check
     * @returns Whether the processing type is enabled
     */
    isProcessingEnabled: (type: 'processMentionedMCPs' | 'processRemixPrompt' | 'processMentionedFiles' | 'processMentionedAgents') => 
        userMessageManager.isProcessingEnabled(type),
    
    /**
     * Set session data
     * @param key Session data key
     * @param value Session data value
     */
    setSessionData: (key: string, value: any) => userMessageManager.setSessionData(key, value),
    
    /**
     * Get session data
     * @param key Session data key
     * @returns Session data value
     */
    getSessionData: (key: string) => userMessageManager.getSessionData(key),
    
    /**
     * Get message timestamp
     * @returns Timestamp when message was received
     */
    getTimestamp: () => userMessageManager.getTimestamp(),
    
    /**
     * Check if there's a current message
     * @returns Whether there's a current message
     */
    hasMessage: () => userMessageManager.hasMessage(),
    
    /**
     * Update processing configuration
     * @param config New processing configuration
     */
    updateProcessingConfig: (config: any) => userMessageManager.updateConfig(config),
    
    /**
     * Clear current user message
     */
    clear: () => userMessageManager.clear()
};
