import fs from 'fs';
import path from 'path';
import { Conversation } from '../types/conversations';

interface StoredConversations {
  conversations: Conversation[];
}

export class ConversationService {
  private static instances: Map<string, ConversationService> = new Map();

  private storagePath: string;
  private conversations: Map<string, Conversation> = new Map();

  private constructor(projectPath: string) {
    const dir = path.resolve(projectPath || process.cwd());
    this.storagePath = path.join(dir, '.codebolt', 'conversations.json');
    this.loadConversations();
  }

  public static getInstance(projectPath: string): ConversationService {
    const resolvedPath = path.resolve(projectPath || process.cwd());
    if (!ConversationService.instances.has(resolvedPath)) {
      ConversationService.instances.set(resolvedPath, new ConversationService(resolvedPath));
    }
    return ConversationService.instances.get(resolvedPath)!;
  }

  public upsertConversation(conversation: Conversation): Conversation {
    const now = new Date().toISOString();
    
    // Get existing conversation if it exists
    const existing = this.conversations.get(conversation.id);
    
    const sanitized: Conversation = {
      ...conversation,
      // Preserve createdAt from existing conversation or use now if new
      createdAt: existing?.createdAt || conversation.createdAt || now,
      updatedAt: now,
      messages: Array.isArray(conversation.messages) ? conversation.messages : [],
    };

    this.conversations.set(sanitized.id, sanitized);
    this.persist();
    return this.cloneConversation(sanitized);
  }

  public getConversation(id: string): Conversation | null {
    const conversation = this.conversations.get(id);
    if (!conversation) {
      return null;
    }
    return this.cloneConversation(conversation);
  }

  private loadConversations(): void {
    try {
      if (!fs.existsSync(this.storagePath)) {
        return;
      }

      const fileContents = fs.readFileSync(this.storagePath, 'utf8');
      if (!fileContents.trim()) {
        return;
      }

      const parsed: StoredConversations | Conversation[] = JSON.parse(fileContents);
      const list: Conversation[] = Array.isArray(parsed) ? parsed : parsed.conversations || [];

      for (const entry of list) {
        if (entry && entry.id) {
          // Preserve all original properties and only add missing timestamps
          const conversationWithTimestamps: Conversation = {
            ...entry,
            createdAt: entry.createdAt || new Date().toISOString(),
            updatedAt: entry.updatedAt || new Date().toISOString(),
            messages: Array.isArray(entry.messages) ? entry.messages : [],
          };
          
          this.conversations.set(entry.id, conversationWithTimestamps);
        }
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }

  private persist(): void {
    try {
      const dir = path.dirname(this.storagePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const payload: StoredConversations = {
        conversations: Array.from(this.conversations.values()),
      };

      fs.writeFileSync(this.storagePath, JSON.stringify(payload, null, 2), 'utf8');
    } catch (error) {
      console.error('Error saving conversations:', error);
    }
  }

  private cloneConversation(conversation: Conversation): Conversation {
    return JSON.parse(JSON.stringify(conversation)) as Conversation;
  }
}
