/**
 * @fileoverview User Context Management for CodeBolt Integration
 * @description Manages user message state and configuration for ComposableAgent
 */

import type { CodeBoltMessage } from './types';

/**
 * Global user context state
 */
interface UserContextState {
  /** Current user message */
  currentMessage?: CodeBoltMessage;
  /** User configuration for processing */
  userConfig?: {
    processMentionedMCPs?: boolean;
    processRemixPrompt?: boolean;
    processMentionedFiles?: boolean;
    processMentionedAgents?: boolean;
  };
  /** Session data */
  sessionData?: Record<string, any>;
}

/**
 * Global user context manager
 */
class UserContextManager {
  private state: UserContextState = {};

  /**
   * Save user message and extract configuration
   * 
   * @param message - CodeBolt message from onMessage
   * @param config - Optional user configuration override
   */
  saveUserMessage(message: CodeBoltMessage, config?: UserContextState['userConfig']): void {
    this.state.currentMessage = message;
    
    // Auto-detect configuration from message if not explicitly provided
    if (config) {
      this.state.userConfig = { ...config };
    } else {
      this.state.userConfig = {
        processMentionedMCPs: message.mentionedMCPs?.length > 0,
        processRemixPrompt: !!message.remixPrompt,
        processMentionedFiles: message.mentionedFiles?.length > 0,
        processMentionedAgents: message.mentionedAgents?.length > 0
      };
    }
  }

  /**
   * Get current user message
   * 
   * @returns Current CodeBolt message or undefined
   */
  getUserMessage(): CodeBoltMessage | undefined {
    return this.state.currentMessage;
  }

  /**
   * Get user configuration
   * 
   * @returns User processing configuration
   */
  getUserConfig(): UserContextState['userConfig'] {
    return this.state.userConfig || {};
  }

  /**
   * Get mentioned MCPs from current message
   * 
   * @returns Array of mentioned MCP tools
   */
  getMentionedMCPs(): { toolbox: string, toolName: string }[] {
    return this.state.currentMessage?.mentionedMCPs || [];
  }

  /**
   * Get mentioned files from current message
   * 
   * @returns Array of mentioned file paths
   */
  getMentionedFiles(): string[] {
    return this.state.currentMessage?.mentionedFiles || [];
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
   * Check if a specific processing type is enabled
   * 
   * @param type - Processing type to check
   * @returns Whether the processing type is enabled
   */
  isProcessingEnabled(type: keyof NonNullable<UserContextState['userConfig']>): boolean {
    return this.state.userConfig?.[type] ?? false;
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
   * Clear all user context (typically called at start of new message)
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
   * Create a simplified message object for agent execution
   * 
   * @returns Simple message object with just text content
   */
  getSimpleMessage(): { text: string; hasContext: boolean } {
    return {
      text: this.getMessageText(),
      hasContext: !!(
        this.state.currentMessage?.mentionedFiles?.length ||
        this.state.currentMessage?.mentionedMCPs?.length ||
        this.state.currentMessage?.mentionedAgents?.length ||
        this.state.currentMessage?.remixPrompt
      )
    };
  }
}

// Global singleton instance
const userContextManager = new UserContextManager();

/**
 * Save user message and configuration globally
 * This should be called in codebolt.onMessage() before creating agents
 * 
 * @param message - CodeBolt message from onMessage
 * @param config - Optional configuration override
 */
export function saveUserMessage(
  message: CodeBoltMessage, 
  config?: {
    processMentionedMCPs?: boolean;
    processRemixPrompt?: boolean;
    processMentionedFiles?: boolean;
    processMentionedAgents?: boolean;
  }
): void {
  userContextManager.saveUserMessage(message, config);
}

/**
 * Get current user message
 * Can be called from anywhere in the agent execution
 * 
 * @returns Current CodeBolt message or undefined
 */
export function getUserMessage(): CodeBoltMessage | undefined {
  return userContextManager.getUserMessage();
}

/**
 * Get user processing configuration
 * 
 * @returns User configuration object
 */
export function getUserConfig() {
  return userContextManager.getUserConfig();
}

/**
 * Get mentioned MCPs from current message
 * 
 * @returns Array of mentioned MCP tools
 */
export function getMentionedMCPs(): { toolbox: string, toolName: string }[] {
  return userContextManager.getMentionedMCPs();
}

/**
 * Get mentioned files from current message
 * 
 * @returns Array of mentioned file paths
 */
export function getMentionedFiles(): string[] {
  return userContextManager.getMentionedFiles();
}

/**
 * Get mentioned agents from current message
 * 
 * @returns Array of mentioned agents
 */
export function getMentionedAgents(): any[] {
  return userContextManager.getMentionedAgents();
}

/**
 * Get remix prompt from current message
 * 
 * @returns Remix prompt string or undefined
 */
export function getRemixPrompt(): string | undefined {
  return userContextManager.getRemixPrompt();
}

/**
 * Check if a specific processing type is enabled
 * 
 * @param type - Processing type to check
 * @returns Whether the processing type is enabled
 */
export function isProcessingEnabled(type: 'processMentionedMCPs' | 'processRemixPrompt' | 'processMentionedFiles' | 'processMentionedAgents'): boolean {
  return userContextManager.isProcessingEnabled(type);
}

/**
 * Get simple message text for agent execution
 * 
 * @returns Message text content
 */
export function getMessageText(): string {
  return userContextManager.getMessageText();
}

/**
 * Get simplified message object
 * 
 * @returns Simple message with text and context flag
 */
export function getSimpleMessage(): { text: string; hasContext: boolean } {
  return userContextManager.getSimpleMessage();
}

/**
 * Set session data
 * 
 * @param key - Session data key
 * @param value - Session data value
 */
export function setSessionData(key: string, value: any): void {
  userContextManager.setSessionData(key, value);
}

/**
 * Get session data
 * 
 * @param key - Session data key
 * @returns Session data value
 */
export function getSessionData(key: string): any {
  return userContextManager.getSessionData(key);
}

/**
 * Clear user context (call at start of new message)
 */
export function clearUserContext(): void {
  userContextManager.clear();
}

// Export the manager for advanced usage
export { userContextManager };
export type { UserContextState };
