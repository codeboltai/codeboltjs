/**
 * @fileoverview User Message Utilities for CodeBolt
 * @description Provides utilities for accessing current user message and context
 */
/**
 * User message utilities for accessing current user message and context
 */
export declare const userMessageUtilities: {
    /**
     * Get the current user message object
     * @returns Current UserMessage or undefined
     */
    getCurrent: () => any;
    /**
     * Get the user message text content
     * @returns Message text string
     */
    getText: () => string;
    /**
     * Get mentioned MCPs from current message
     * @returns Array of MCP tools
     */
    getMentionedMCPs: () => string[];
    /**
     * Get mentioned files from current message
     * @returns Array of file paths
     */
    getMentionedFiles: () => string[];
    /**
     * Get mentioned folders from current message
     * @returns Array of folder paths
     */
    getMentionedFolders: () => string[];
    /**
     * Get mentioned agents from current message
     * @returns Array of agent objects
     */
    getMentionedAgents: () => any[];
    /**
     * Get remix prompt from current message
     * @returns Remix prompt string or undefined
     */
    getRemixPrompt: () => string | undefined;
    /**
     * Get uploaded images from current message
     * @returns Array of image objects
     */
    getUploadedImages: () => any[];
    /**
     * Get current file path
     * @returns Current file path or undefined
     */
    getCurrentFile: () => string | undefined;
    /**
     * Get text selection from current message
     * @returns Selected text or undefined
     */
    getSelection: () => string | undefined;
    /**
     * Get message ID
     * @returns Message ID or undefined
     */
    getMessageId: () => string | undefined;
    /**
     * Get thread ID
     * @returns Thread ID or undefined
     */
    getThreadId: () => string | undefined;
    /**
     * Get processing configuration
     * @returns Processing configuration object
     */
    getProcessingConfig: () => AgentProcessingConfig;
    /**
     * Check if a processing type is enabled
     * @param type Processing type to check
     * @returns Whether the processing type is enabled
     */
    isProcessingEnabled: (type: "processMentionedMCPs" | "processRemixPrompt" | "processMentionedFiles" | "processMentionedAgents") => boolean;
    /**
     * Set session data
     * @param key Session data key
     * @param value Session data value
     */
    setSessionData: (key: string, value: any) => void;
    /**
     * Get session data
     * @param key Session data key
     * @returns Session data value
     */
    getSessionData: (key: string) => any;
    /**
     * Get message timestamp
     * @returns Timestamp when message was received
     */
    getTimestamp: () => string | undefined;
    /**
     * Check if there's a current message
     * @returns Whether there's a current message
     */
    hasMessage: () => boolean;
    /**
     * Update processing configuration
     * @param config New processing configuration
     */
    updateProcessingConfig: (config: any) => void;
    /**
     * Clear current user message
     */
    clear: () => void;
};
