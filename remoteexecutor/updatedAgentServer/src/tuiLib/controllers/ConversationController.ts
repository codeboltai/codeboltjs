import { Request, Response } from 'express';
import path from 'path';
import { ConversationService } from '../../main/services/ConversationService';
import { Conversation, ConversationInsertRequest } from '../../types/conversations';

export class ConversationController {
  public async addConversation(req: Request, res: Response): Promise<void> {
    try {
      const payload = req.body as ConversationInsertRequest | undefined;
      if (!payload || !payload.conversation) {
        res.status(400).json({ success: false, error: 'conversation payload is required' });
        return;
      }

      const conversation = this.normalizeConversation(payload.conversation);
      if (!conversation.id) {
        res.status(400).json({ success: false, error: 'conversation id is required' });
        return;
      }

      const service = ConversationService.getInstance(this.resolveProjectPath(req, payload.projectPath));
      const saved = service.upsertConversation(conversation);

      res.status(201).json({ success: true, conversation: saved });
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Failed to save conversation' });
    }
  }

  public async getConversation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ success: false, error: 'conversation id is required' });
        return;
      }

      const projectPath = typeof req.query.projectPath === 'string' ? req.query.projectPath : undefined;
      const service = ConversationService.getInstance(this.resolveProjectPath(req, projectPath));
      const conversation = service.getConversation(id);

      if (!conversation) {
        res.status(404).json({ success: false, error: 'conversation not found' });
        return;
      }

      res.json({ success: true, conversation });
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Failed to fetch conversation' });
    }
  }

  private resolveProjectPath(req: Request, provided?: string): string {
    if (provided) {
      return path.resolve(provided);
    }
    const agentDetail = typeof req.query.agentDetail === 'string' ? req.query.agentDetail : undefined;
    if (req.query.agentType === 'local-path' && agentDetail) {
      return path.resolve(agentDetail);
    }
    return process.cwd();
  }

  private normalizeConversation(conversation: Conversation): Conversation {
    const now = new Date().toISOString();
    return {
      id: conversation.id,
      title: conversation.title || 'Conversation',
      createdAt: conversation.createdAt || now,
      updatedAt: conversation.updatedAt || now,
      messages: Array.isArray(conversation.messages) ? conversation.messages : [],
      options: conversation.options,
    };
  }
}
