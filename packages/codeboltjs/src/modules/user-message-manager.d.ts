/**
 * @fileoverview Global User Message Manager for CodeBolt
 * @description Automatically manages the current user message for agent integration
 */
import type { FlatUserMessage, AgentProcessingConfig } from '@codebolt/types/sdk';
/**
 * User processing configuration (alias for AgentProcessingConfig)
 */
export type UserProcessingConfig = AgentProcessingConfig;
/**
 * Global user message manager
 */
declare class UserMessageManager {
    private state;
    /**
     * Save user message (called automatically by onMessage)
     *
     * @param message - User message from onMessage
     * @param config - Optional processing configuration
     */
    saveMessage(message: FlatUserMessage, config?: UserProcessingConfig): void;
    /**
     * Get current user message
     *
     * @returns Current user message or undefined
     */
    getMessage(): FlatUserMessage | undefined;
    /**
     * Get user processing configuration
     *
     * @returns User processing configuration
     */
    getConfig(): UserProcessingConfig;
    /**
     * Get mentioned MCPs from current message
     *
     * @returns Array of mentioned MCP tools
     */
    getMentionedMCPs(): string[];
    /**
     * Get mentioned files from current message
     *
     * @returns Array of mentioned file paths
     */
    getMentionedFiles(): string[];
    /**
     * Get mentioned folders from current message
     *
     * @returns Array of mentioned folder paths
     */
    getMentionedFolders(): string[];
    /**
     * Get mentioned agents from current message
     *
     * @returns Array of mentioned agents
     */
    getMentionedAgents(): any[];
    /**
     * Get remix prompt from current message
     *
     * @returns Remix prompt string or undefined
     */
    getRemixPrompt(): string | undefined;
    /**
     * Get uploaded images from current message
     *
     * @returns Array of uploaded images
     */
    getUploadedImages(): any[];
    /**
     * Get current file from current message
     *
     * @returns Current file path or undefined
     */
    getCurrentFile(): string | undefined;
    /**
     * Get text selection from current message
     *
     * @returns Text selection or undefined
     */
    getSelection(): string | undefined;
    /**
     * Get message ID
     *
     * @returns Message ID or undefined
     */
    getMessageId(): string | undefined;
    /**
     * Get thread ID
     *
     * @returns Thread ID or undefined
     */
    getThreadId(): string | undefined;
    /**
     * Check if a specific processing type is enabled
     *
     * @param type - Processing type to check
     * @returns Whether the processing type is enabled
     */
    isProcessingEnabled(type: keyof UserProcessingConfig): boolean;
    /**
     * Set session data
     *
     * @param key - Session data key
     * @param value - Session data value
     */
    setSessionData(key: string, value: any): void;
    /**
     * Get session data
     *
     * @param key - Session data key
     * @returns Session data value
     */
    getSessionData(key: string): any;
    /**
     * Clear all user message state
     */
    clear(): void;
    /**
     * Get current message text content
     *
     * @returns User message text
     */
    getMessageText(): string;
    /**
     * Get message timestamp
     *
     * @returns Timestamp when message was saved
     */
    getTimestamp(): string | undefined;
    /**
     * Update processing configuration
     *
     * @param config - New processing configuration
     */
    updateConfig(config: Partial<UserProcessingConfig>): void;
    /**
     * Check if there's a current message
     *
     * @returns Whether there's a current message
     */
    hasMessage(): boolean;
}
declare const userMessageManager: UserMessageManager;
export { userMessageManager };
export declare function getCurrentUserMessage(): FlatUserMessage | undefined;
export declare function getUserMessageText(): string;
export declare function getUserProcessingConfig(): UserProcessingConfig;
export declare function getMentionedMCPs(): string[];
export declare function getMentionedFiles(): string[];
export declare function getMentionedFolders(): string[];
export declare function getMentionedAgents(): any[];
export declare function getRemixPrompt(): string | undefined;
export declare function getUploadedImages(): any[];
export declare function getCurrentFile(): string | undefined;
export declare function getSelection(): string | undefined;
export declare function getMessageId(): string | undefined;
export declare function getThreadId(): string | undefined;
export declare function isUserProcessingEnabled(type: keyof UserProcessingConfig): boolean;
export declare function setUserSessionData(key: string, value: any): void;
export declare function getUserSessionData(key: string): any;
export declare function clearUserMessage(): void;
export declare function getUserMessageTimestamp(): string | undefined;
export declare function updateUserProcessingConfig(config: Partial<UserProcessingConfig>): void;
export declare function hasCurrentUserMessage(): boolean;
