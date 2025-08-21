/**
 * @fileoverview Memory and Storage implementations for Composable Agent Pattern
 * @description Provides memory management and various storage providers for agent conversations
 */

import type { 
  MemoryConfig, 
  StorageProvider, 
  Message 
} from './types';
import { 
  createCodeBoltStore, 
  type CodeBoltStoreConfig 
} from './codebolt-storage';




/**
 * Memory management for agent conversations
 */
export class Memory {
  private storage: StorageProvider;
  private maxMessages: number;
  private autoSave: boolean;
  private conversationKey: string = 'conversation_history';

  constructor(config: MemoryConfig) {
    this.storage = config.storage;
    this.maxMessages = config.maxMessages || 100;
    this.autoSave = config.autoSave ?? true;
  }

  /**
   * Save messages to storage
   * 
   * @param messages - Array of messages to save
   * @param key - Optional key for storage (defaults to conversation_history)
   */
  async saveMessages(messages: Message[], key?: string): Promise<void> {
    const storageKey = key || this.conversationKey;
    
    // Trim messages if they exceed max limit
    const trimmedMessages = this.maxMessages > 0 && messages.length > this.maxMessages
      ? messages.slice(-this.maxMessages)
      : messages;

    await this.storage.set(storageKey, trimmedMessages);
  }

  /**
   * Load messages from storage
   * 
   * @param key - Optional key for storage (defaults to conversation_history)
   * @returns Array of loaded messages
   */
  async loadMessages(key?: string): Promise<Message[]> {
    const storageKey = key || this.conversationKey;
    const messages = await this.storage.get(storageKey);
    return Array.isArray(messages) ? messages : [];
  }

  /**
   * Add a message to the conversation and optionally save
   * 
   * @param message - Message to add
   * @param messages - Current messages array
   * @param save - Whether to auto-save to storage
   * @returns Updated messages array
   */
  async addMessage(message: Message, messages: Message[], save: boolean = this.autoSave): Promise<Message[]> {
    const updatedMessages = [...messages, message];
    
    if (save) {
      await this.saveMessages(updatedMessages);
    }
    
    return updatedMessages;
  }

  /**
   * Clear conversation history
   * 
   * @param key - Optional key for storage (defaults to conversation_history)
   */
  async clearMessages(key?: string): Promise<void> {
    const storageKey = key || this.conversationKey;
    await this.storage.delete(storageKey);
  }

  /**
   * Get storage provider for custom operations
   */
  getStorage(): StorageProvider {
    return this.storage;
  }

  /**
   * Set conversation key for multi-conversation support
   * 
   * @param key - New conversation key
   */
  setConversationKey(key: string): void {
    this.conversationKey = key;
  }

  /**
   * List all conversation keys
   * 
   * @returns Array of conversation keys
   */
  async listConversations(): Promise<string[]> {
    const allKeys = await this.storage.keys();
    return allKeys.filter(key => key.includes('conversation') || key.includes('history'));
  }
}


/**
 * Create a Memory instance with CodeBolt backend storage
 * 
 * @param config - CodeBolt storage configuration
 * @returns Memory instance
 */
export function createCodeBoltMemory(config: CodeBoltStoreConfig): Memory {
  return new Memory({
    storage: createCodeBoltStore(config)
  });
}

/**
 * Create a Memory instance with CodeBolt agent state storage
 * 
 * @param prefix - Optional prefix for storage keys
 * @returns Memory instance
 */
export function createCodeBoltAgentMemory(prefix?: string): Memory {
  return new Memory({
    storage: createCodeBoltStore({ type: 'agent', prefix })
  });
}

/**
 * Create a Memory instance with CodeBolt project state storage
 * 
 * @param prefix - Optional prefix for storage keys
 * @returns Memory instance
 */
export function createCodeBoltProjectMemory(prefix?: string): Memory {
  return new Memory({
    storage: createCodeBoltStore({ type: 'project', prefix })
  });
}

/**
 * Create a Memory instance with CodeBolt memory database storage
 * 
 * @param prefix - Optional prefix for storage keys
 * @returns Memory instance
 */
export function createCodeBoltDbMemory(prefix?: string): Memory {
  return new Memory({
    storage: createCodeBoltStore({ type: 'memory', prefix })
  });
}
