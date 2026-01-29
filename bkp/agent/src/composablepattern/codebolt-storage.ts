/**
 * @fileoverview CodeBolt Backend Storage Provider for Composable Agent Pattern
 * @description Uses CodeBolt's state and memory functions instead of SQLite for storage
 */

import type { StorageProvider } from './types';
import codeboltjs from '@codebolt/codeboltjs';

/**
 * Storage provider that uses CodeBolt's agent state backend
 * Data is persisted in the CodeBolt application's agent state
 */
export class CodeBoltAgentStore implements StorageProvider {
  private prefix: string;

  constructor(prefix: string = 'composable_agent') {
    this.prefix = prefix;
  }

  private getFullKey(key: string): string {
    return `${this.prefix}_${key}`;
  }

  async get(key: string): Promise<any> {
    try {
      const fullKey = this.getFullKey(key);
      const response = await codeboltjs.cbstate.getAgentState();
      
      if (response.success && response.data && response.data[fullKey]) {
        const value = response.data[fullKey];
        try {
          return JSON.parse(value);
        } catch (error) {
          return value;
        }
      }
      
      return undefined;
    } catch (error) {
      console.error('CodeBoltAgentStore.get error:', error);
      return undefined;
    }
  }

  async set(key: string, value: any): Promise<void> {
    try {
      const fullKey = this.getFullKey(key);
      const serializedValue = typeof value === 'string' 
        ? value 
        : JSON.stringify(value);
      
      await codeboltjs.cbstate.addToAgentState(fullKey, serializedValue);
    } catch (error) {
      console.error('CodeBoltAgentStore.set error:', error);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const fullKey = this.getFullKey(key);
      // CodeBolt agent state doesn't have direct delete, so we set to null
      await codeboltjs.cbstate.addToAgentState(fullKey, 'null');
    } catch (error) {
      console.error('CodeBoltAgentStore.delete error:', error);
      throw error;
    }
  }

  async keys(): Promise<string[]> {
    try {
      const response = await codeboltjs.cbstate.getAgentState();
      
      if (response.success && response.data) {
        const allKeys = Object.keys(response.data);
        const prefixedKeys = allKeys.filter(key => key.startsWith(`${this.prefix}_`));
        
        // Remove prefix and filter out null values
        const result: string[] = [];
        for (const prefixedKey of prefixedKeys) {
          const value = response.data[prefixedKey];
          if (value !== 'null') {
            result.push(prefixedKey.replace(`${this.prefix}_`, ''));
          }
        }
        
        return result;
      }
      
      return [];
    } catch (error) {
      console.error('CodeBoltAgentStore.keys error:', error);
      return [];
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await this.keys();
      
      // Delete all keys by setting them to null
      for (const key of keys) {
        await this.delete(key);
      }
    } catch (error) {
      console.error('CodeBoltAgentStore.clear error:', error);
      throw error;
    }
  }
}

/**
 * Storage provider that uses CodeBolt's in-memory database (dbmemory)
 * Data is persisted in the CodeBolt application's memory database
 */
export class CodeBoltMemoryStore implements StorageProvider {
  private prefix: string;

  constructor(prefix: string = 'composable_agent') {
    this.prefix = prefix;
  }

  private getFullKey(key: string): string {
    return `${this.prefix}_${key}`;
  }

  async get(key: string): Promise<any> {
    try {
      const fullKey = this.getFullKey(key);
      const response = await codeboltjs.dbmemory.getKnowledge(fullKey);
      
      if (response.success && response.data !== undefined) {
        return response.data;
      }
      
      return undefined;
    } catch (error) {
      console.error('CodeBoltMemoryStore.get error:', error);
      return undefined;
    }
  }

  async set(key: string, value: any): Promise<void> {
    try {
      const fullKey = this.getFullKey(key);
      await codeboltjs.dbmemory.addKnowledge(fullKey, value);
    } catch (error) {
      console.error('CodeBoltMemoryStore.set error:', error);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const fullKey = this.getFullKey(key);
      // CodeBolt dbmemory doesn't have direct delete, so we set to null
      await codeboltjs.dbmemory.addKnowledge(fullKey, null);
    } catch (error) {
      console.error('CodeBoltMemoryStore.delete error:', error);
      throw error;
    }
  }

  async keys(): Promise<string[]> {
    try {
      // CodeBolt dbmemory doesn't have a keys() method
      // We'll need to maintain a key index
      const indexKey = `${this.prefix}_key_index`;
      const response = await codeboltjs.dbmemory.getKnowledge(indexKey);
      
      if (response.success && Array.isArray(response.data)) {
        // Filter out deleted keys (those with null values)
        const validKeys: string[] = [];
        for (const key of response.data) {
          const value = await this.get(key);
          if (value !== null) {
            validKeys.push(key);
          }
        }
        return validKeys;
      }
      
      return [];
    } catch (error) {
      console.error('CodeBoltMemoryStore.keys error:', error);
      return [];
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await this.keys();
      
      // Delete all keys
      for (const key of keys) {
        await this.delete(key);
      }
      
      // Clear the key index
      const indexKey = `${this.prefix}_key_index`;
      await codeboltjs.dbmemory.addKnowledge(indexKey, []);
    } catch (error) {
      console.error('CodeBoltMemoryStore.clear error:', error);
      throw error;
    }
  }

  /**
   * Override set to maintain key index
   */
  async setWithIndex(key: string, value: any): Promise<void> {
    try {
      // Update the key index
      const indexKey = `${this.prefix}_key_index`;
      const response = await codeboltjs.dbmemory.getKnowledge(indexKey);
      
      let keyIndex: string[] = [];
      if (response.success && Array.isArray(response.data)) {
        keyIndex = response.data;
      }
      
      if (!keyIndex.includes(key)) {
        keyIndex.push(key);
        await codeboltjs.dbmemory.addKnowledge(indexKey, keyIndex);
      }
      
      // Set the actual value
      await this.set(key, value);
    } catch (error) {
      console.error('CodeBoltMemoryStore.setWithIndex error:', error);
      throw error;
    }
  }
}

/**
 * Storage provider that uses CodeBolt's project state backend
 * Data is persisted in the CodeBolt application's project state
 */
export class CodeBoltProjectStore implements StorageProvider {
  private prefix: string;

  constructor(prefix: string = 'composable_agent') {
    this.prefix = prefix;
  }

  private getFullKey(key: string): string {
    return `${this.prefix}_${key}`;
  }

  async get(key: string): Promise<any> {
    try {
      const fullKey = this.getFullKey(key);
      const response = await codeboltjs.cbstate.getProjectState();
      
      if (response.success && response.data && response.data[fullKey] !== undefined) {
        return response.data[fullKey];
      }
      
      return undefined;
    } catch (error) {
      console.error('CodeBoltProjectStore.get error:', error);
      return undefined;
    }
  }

  async set(key: string, value: any): Promise<void> {
    try {
      const fullKey = this.getFullKey(key);
      await codeboltjs.cbstate.updateProjectState(fullKey, value);
    } catch (error) {
      console.error('CodeBoltProjectStore.set error:', error);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const fullKey = this.getFullKey(key);
      // Set to null to indicate deletion
      await codeboltjs.cbstate.updateProjectState(fullKey, null);
    } catch (error) {
      console.error('CodeBoltProjectStore.delete error:', error);
      throw error;
    }
  }

  async keys(): Promise<string[]> {
    try {
      const response = await codeboltjs.cbstate.getProjectState();
      
      if (response.success && response.data) {
        const allKeys = Object.keys(response.data);
        const prefixedKeys = allKeys.filter(key => key.startsWith(`${this.prefix}_`));
        
        // Remove prefix and filter out null values
        const result: string[] = [];
        for (const prefixedKey of prefixedKeys) {
          const value = response.data[prefixedKey];
          if (value !== null) {
            result.push(prefixedKey.replace(`${this.prefix}_`, ''));
          }
        }
        
        return result;
      }
      
      return [];
    } catch (error) {
      console.error('CodeBoltProjectStore.keys error:', error);
      return [];
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await this.keys();
      
      // Delete all keys by setting them to null
      for (const key of keys) {
        await this.delete(key);
      }
    } catch (error) {
      console.error('CodeBoltProjectStore.clear error:', error);
      throw error;
    }
  }
}

/**
 * Configuration for CodeBolt storage providers
 */
export interface CodeBoltStoreConfig {
  /** Storage type to use */
  type: 'agent' | 'memory' | 'project';
  /** Prefix for storage keys to avoid conflicts */
  prefix?: string;
}

/**
 * Factory function to create appropriate CodeBolt storage provider
 * 
 * @param config - Storage configuration
 * @returns StorageProvider instance
 */
export function createCodeBoltStore(config: CodeBoltStoreConfig): StorageProvider {
  const { type, prefix = 'composable_agent' } = config;

  switch (type) {
    case 'agent':
      return new CodeBoltAgentStore(prefix);
    case 'memory':
      return new CodeBoltMemoryStore(prefix);
    case 'project':
      return new CodeBoltProjectStore(prefix);
    default:
      throw new Error(`Unknown CodeBolt storage type: ${type}`);
  }
}
