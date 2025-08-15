/**
 * @fileoverview Memory and Storage implementations for Composable Agent Pattern
 * @description Provides memory management and various storage providers for agent conversations
 */

import type { 
  MemoryConfig, 
  StorageProvider, 
  LibSQLStoreConfig, 
  Message 
} from './types';
import { 
  createCodeBoltStore, 
  type CodeBoltStoreConfig 
} from './codebolt-storage';

/**
 * In-memory storage provider (data is lost when process ends)
 */
export class InMemoryStore implements StorageProvider {
  private data: Map<string, any> = new Map();

  async get(key: string): Promise<any> {
    return this.data.get(key);
  }

  async set(key: string, value: any): Promise<void> {
    this.data.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.data.delete(key);
  }

  async keys(): Promise<string[]> {
    return Array.from(this.data.keys());
  }

  async clear(): Promise<void> {
    this.data.clear();
  }
}

/**
 * File-based storage provider using JSON files
 */
export class FileStore implements StorageProvider {
  private filePath: string;
  private data: Map<string, any> = new Map();
  private loaded: boolean = false;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  private async ensureLoaded(): Promise<void> {
    if (this.loaded) return;

    try {
      const fs = await import('fs/promises');
      const content = await fs.readFile(this.filePath, 'utf-8');
      const data = JSON.parse(content);
      this.data = new Map(Object.entries(data));
    } catch (error) {
      // File doesn't exist or is invalid, start with empty data
      this.data = new Map();
    }
    
    this.loaded = true;
  }

  private async save(): Promise<void> {
    const fs = await import('fs/promises');
    const data = Object.fromEntries(this.data);
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
  }

  async get(key: string): Promise<any> {
    await this.ensureLoaded();
    return this.data.get(key);
  }

  async set(key: string, value: any): Promise<void> {
    await this.ensureLoaded();
    this.data.set(key, value);
    await this.save();
  }

  async delete(key: string): Promise<void> {
    await this.ensureLoaded();
    this.data.delete(key);
    await this.save();
  }

  async keys(): Promise<string[]> {
    await this.ensureLoaded();
    return Array.from(this.data.keys());
  }

  async clear(): Promise<void> {
    this.data.clear();
    await this.save();
  }
}

/**
 * LibSQL/SQLite storage provider
 */
export class LibSQLStore implements StorageProvider {
  private config: LibSQLStoreConfig;
  private db: any = null;
  private tableName: string;

  constructor(config: LibSQLStoreConfig) {
    this.config = config;
    this.tableName = config.tableName || 'agent_storage';
  }

  private async getDb(): Promise<any> {
    if (this.db) return this.db;

    try {
      // Try to import @libsql/client
      const { createClient } = await import('@libsql/client');
      this.db = createClient({
        url: this.config.url,
        authToken: this.config.authToken
      });
    } catch (error) {
      // Fallback to better-sqlite3 for local files
      try {
        const Database = await import('better-sqlite3') as any;
        this.db = new (Database.default || Database)(this.config.url.replace('file:', ''));
      } catch (fallbackError) {
        throw new Error(
          'No SQLite client available. Please install @libsql/client or better-sqlite3'
        );
      }
    }

    await this.initializeTable();
    return this.db;
  }

  private async initializeTable(): Promise<void> {
    const db = await this.getDb();
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    if (this.db.execute) {
      // LibSQL client
      await this.db.execute(createTableSQL);
    } else {
      // better-sqlite3
      this.db.exec(createTableSQL);
    }
  }

  async get(key: string): Promise<any> {
    const db = await this.getDb();
    
    const query = `SELECT value FROM ${this.tableName} WHERE key = ?`;
    
    let result;
    if (db.execute) {
      // LibSQL client
      const rows = await db.execute({ sql: query, args: [key] });
      result = rows.rows[0];
    } else {
      // better-sqlite3
      result = db.prepare(query).get(key);
    }

    if (!result) return undefined;
    
    try {
      return JSON.parse(result.value || result[0]);
    } catch (error) {
      return result.value || result[0];
    }
  }

  async set(key: string, value: any): Promise<void> {
    const db = await this.getDb();
    
    const serializedValue = typeof value === 'string' 
      ? value 
      : JSON.stringify(value);

    const query = `
      INSERT INTO ${this.tableName} (key, value, updated_at) 
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET 
        value = excluded.value,
        updated_at = CURRENT_TIMESTAMP
    `;

    if (db.execute) {
      // LibSQL client
      await db.execute({ sql: query, args: [key, serializedValue] });
    } else {
      // better-sqlite3
      db.prepare(query).run(key, serializedValue);
    }
  }

  async delete(key: string): Promise<void> {
    const db = await this.getDb();
    
    const query = `DELETE FROM ${this.tableName} WHERE key = ?`;
    
    if (db.execute) {
      // LibSQL client
      await db.execute({ sql: query, args: [key] });
    } else {
      // better-sqlite3
      db.prepare(query).run(key);
    }
  }

  async keys(): Promise<string[]> {
    const db = await this.getDb();
    
    const query = `SELECT key FROM ${this.tableName}`;
    
    let rows;
    if (db.execute) {
      // LibSQL client
      const result = await db.execute(query);
      rows = result.rows;
    } else {
      // better-sqlite3
      rows = db.prepare(query).all();
    }

    return rows.map((row: any) => row.key || row[0]);
  }

  async clear(): Promise<void> {
    const db = await this.getDb();
    
    const query = `DELETE FROM ${this.tableName}`;
    
    if (db.execute) {
      // LibSQL client
      await db.execute(query);
    } else {
      // better-sqlite3
      db.exec(query);
    }
  }
}

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
 * Create a Memory instance with LibSQL storage
 * 
 * @param config - LibSQL configuration
 * @returns Memory instance
 */
export function createLibSQLMemory(config: LibSQLStoreConfig): Memory {
  return new Memory({
    storage: new LibSQLStore(config)
  });
}

/**
 * Create a Memory instance with file storage
 * 
 * @param filePath - Path to the storage file
 * @returns Memory instance
 */
export function createFileMemory(filePath: string): Memory {
  return new Memory({
    storage: new FileStore(filePath)
  });
}

/**
 * Create a Memory instance with in-memory storage
 * 
 * @returns Memory instance
 */
export function createInMemoryMemory(): Memory {
  return new Memory({
    storage: new InMemoryStore()
  });
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
