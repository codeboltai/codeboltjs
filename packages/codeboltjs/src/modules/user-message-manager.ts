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
 * Global user message state
 */
interface UserMessageState {
  /** Current user message */
  currentMessage?: FlatUserMessage;
  /** User configuration for processing */
  userConfig?: UserProcessingConfig;
  /** Session data */
  sessionData?: Record<string, any>;
  /** Message timestamp */
  timestamp?: string;
}

/**
 * Global user message manager
 */
class UserMessageManager {
  private state: UserMessageState = {};

  /**
   * Save user message (called automatically by onMessage)
   * 
   * @param message - User message from onMessage
   * @param config - Optional processing configuration
   */
  saveMessage(message: FlatUserMessage, config?: UserProcessingConfig): void {
    this.state.currentMessage = message;
    this.state.timestamp = new Date().toISOString();
    
    // Auto-detect configuration from message if not explicitly provided
    if (config) {
      this.state.userConfig = { ...config };
    } else {
      this.state.userConfig = {
        processMentionedMCPs: message.mentionedMCPs?.length > 0,
        processRemixPrompt: !!message.remixPrompt,
        processMentionedFiles: (message.mentionedFiles?.length > 0) || (message.mentionedFullPaths?.length > 0),
        processMentionedAgents: message.mentionedAgents?.length > 0
      };
    }
  }

  /**
   * Get current user message
   * 
   * @returns Current user message or undefined
   */
  getMessage(): FlatUserMessage | undefined {
    return this.state.currentMessage;
  }

  /**
   * Get user processing configuration
   * 
   * @returns User processing configuration
   */
  getConfig(): UserProcessingConfig {
    return this.state.userConfig || {};
  }

  /**
   * Get mentioned MCPs from current message
   * 
   * @returns Array of mentioned MCP tools
   */
  getMentionedMCPs(): string[] {
    return this.state.currentMessage?.mentionedMCPs || [];
  }

  /**
   * Get mentioned files from current message
   * 
   * @returns Array of mentioned file paths
   */
  getMentionedFiles(): string[] {
    const files = this.state.currentMessage?.mentionedFiles || [];
    const fullPaths = this.state.currentMessage?.mentionedFullPaths || [];
    return [...files, ...fullPaths];
  }

  /**
   * Get mentioned folders from current message
   * 
   * @returns Array of mentioned folder paths
   */
  getMentionedFolders(): string[] {
    return this.state.currentMessage?.mentionedFolders || [];
  }

  /**
   * Get mentioned agents from current message
   * 
   * @returns Array of mentioned agents
   */
  getMentionedAgents(): any[] {
    return this.state.currentMessage?.mentionedAgents || [];
  }

  /**
   * Get remix prompt from current message
   * 
   * @returns Remix prompt string or undefined
   */
  getRemixPrompt(): string | undefined {
    return this.state.currentMessage?.remixPrompt;
  }

  /**
   * Get uploaded images from current message
   * 
   * @returns Array of uploaded images
   */
  getUploadedImages(): any[] {
    return this.state.currentMessage?.uploadedImages || [];
  }

  /**
   * Get current file from current message
   * 
   * @returns Current file path or undefined
   */
  getCurrentFile(): string | undefined {
    return this.state.currentMessage?.currentFile;
  }

  /**
   * Get text selection from current message
   * 
   * @returns Text selection or undefined
   */
  getSelection(): string | undefined {
    return this.state.currentMessage?.selection;
  }

  /**
   * Get message ID
   * 
   * @returns Message ID or undefined
   */
  getMessageId(): string | undefined {
    return this.state.currentMessage?.messageId;
  }

  /**
   * Get thread ID
   * 
   * @returns Thread ID or undefined
   */
  getThreadId(): string | undefined {
    return this.state.currentMessage?.threadId;
  }

  /**
   * Check if a specific processing type is enabled
   * 
   * @param type - Processing type to check
   * @returns Whether the processing type is enabled
   */
  isProcessingEnabled(type: keyof UserProcessingConfig): boolean {
    const value = this.state.userConfig?.[type];
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
  setSessionData(key: string, value: any): void {
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
  getSessionData(key: string): any {
    return this.state.sessionData?.[key];
  }

  /**
   * Clear all user message state
   */
  clear(): void {
    this.state = {};
  }

  /**
   * Get current message text content
   * 
   * @returns User message text
   */
  getMessageText(): string {
    return this.state.currentMessage?.userMessage || '';
  }

  /**
   * Get message timestamp
   * 
   * @returns Timestamp when message was saved
   */
  getTimestamp(): string | undefined {
    return this.state.timestamp;
  }

  /**
   * Update processing configuration
   * 
   * @param config - New processing configuration
   */
  updateConfig(config: Partial<UserProcessingConfig>): void {
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
  hasMessage(): boolean {
    return !!this.state.currentMessage;
  }
}

// Global singleton instance
const userMessageManager = new UserMessageManager();

// Export the manager instance for internal use
export { userMessageManager };

// Export utility functions for public API
export function getCurrentUserMessage(): FlatUserMessage | undefined {
  return userMessageManager.getMessage();
}

export function getUserMessageText(): string {
  return userMessageManager.getMessageText();
}

export function getUserProcessingConfig(): UserProcessingConfig {
  return userMessageManager.getConfig();
}

export function getMentionedMCPs(): string[] {
  return userMessageManager.getMentionedMCPs();
}

export function getMentionedFiles(): string[] {
  return userMessageManager.getMentionedFiles();
}

export function getMentionedFolders(): string[] {
  return userMessageManager.getMentionedFolders();
}

export function getMentionedAgents(): any[] {
  return userMessageManager.getMentionedAgents();
}

export function getRemixPrompt(): string | undefined {
  return userMessageManager.getRemixPrompt();
}

export function getUploadedImages(): any[] {
  return userMessageManager.getUploadedImages();
}

export function getCurrentFile(): string | undefined {
  return userMessageManager.getCurrentFile();
}

export function getSelection(): string | undefined {
  return userMessageManager.getSelection();
}

export function getMessageId(): string | undefined {
  return userMessageManager.getMessageId();
}

export function getThreadId(): string | undefined {
  return userMessageManager.getThreadId();
}

export function isUserProcessingEnabled(type: keyof UserProcessingConfig): boolean {
  return userMessageManager.isProcessingEnabled(type);
}

export function setUserSessionData(key: string, value: any): void {
  userMessageManager.setSessionData(key, value);
}

export function getUserSessionData(key: string): any {
  return userMessageManager.getSessionData(key);
}

export function clearUserMessage(): void {
  userMessageManager.clear();
}

export function getUserMessageTimestamp(): string | undefined {
  return userMessageManager.getTimestamp();
}

export function updateUserProcessingConfig(config: Partial<UserProcessingConfig>): void {
  userMessageManager.updateConfig(config);
}

export function hasCurrentUserMessage(): boolean {
  return userMessageManager.hasMessage();
}
