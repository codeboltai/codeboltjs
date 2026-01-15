import { Request, Response } from 'express';
import { TodoService } from '../../main/server/services/TodoService';
import path from 'path';
import os from 'os';

export class TodoController {
  constructor() {
    // No need to initialize TodoService here since we'll create it dynamically
  }

  /**
   * Get all todos
   * @param req Express Request
   * @param res Express Response
   */
  public async getTodos(req: Request, res: Response): Promise<void> {
    try {
      // Extract project path from query parameters or use default
      const projectPath = this.getProjectPath(req);
      const todoService = TodoService.getInstance(projectPath);
      const todos = await todoService.getTodos();
      res.json({
        success: true,
        todos: todos
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  /**
   * Get todos by thread ID
   * @param req Express Request
   * @param res Express Response
   */
  public async getTodosByThreadId(req: Request, res: Response): Promise<void> {
    try {
      const { threadId } = req.params;
      // Extract project path from query parameters or use default
      const projectPath = this.getProjectPath(req);
      const todoService = TodoService.getInstance(projectPath);
      const todos = await todoService.getTodosByThreadId(threadId);
      
      res.json({
        success: true,
        todos: todos
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  /**
   * Get all thread IDs
   * @param req Express Request
   * @param res Express Response
   */
  public async getThreadIds(req: Request, res: Response): Promise<void> {
    try {
      // Extract project path from query parameters or use default
      const projectPath = this.getProjectPath(req);
      const todoService = TodoService.getInstance(projectPath);
      const threadIds = await todoService.getThreadIds();
      
      res.json({
        success: true,
        threadIds: threadIds
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  /**
   * Extract project path from request query parameters or use default
   * @param req Express Request
   * @returns Project path
   */
  private getProjectPath(req: Request): string {
    // Check if projectPath is provided in query parameters
    if (req.query.projectPath && typeof req.query.projectPath === 'string') {
      return path.resolve(req.query.projectPath);
    }
    
    // If agent detail is provided in query parameters and it's a local path, use that
    if (req.query.agentType === 'local-path' && req.query.agentDetail && typeof req.query.agentDetail === 'string') {
      return path.resolve(req.query.agentDetail);
    }
    
    // Default to current working directory
    return process.cwd();
  }
}