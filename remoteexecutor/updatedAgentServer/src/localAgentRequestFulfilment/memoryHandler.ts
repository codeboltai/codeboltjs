import {
  ClientConnection,
  formatLogMessage
} from '../types';
import { NotificationService } from '../services/NotificationService.js';
import type { MemoryEvent, DbMemoryNotificationBase } from '@codebolt/types/agent-to-app-ws-types';
import { ConnectionManager } from '../core/connectionManagers/connectionManager.js';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

// Extend the base interface to include data property and isError
interface MemoryNotification extends DbMemoryNotificationBase {
  data?: {
    action?: string;
    result?: any;
    error?: string;
    key?: string;
    value?: any;
    [key: string]: any;
  };
  isError?: boolean;
}

/**
 * Handles memory events with actual implementation and notifications
 * Based on memoryService.cli.ts from the main CodeBolt application
 */
export class MemoryHandler {
  private notificationService: NotificationService;
  private connectionManager: ConnectionManager;
  private filePath: string | undefined;

  constructor() {
    this.notificationService = NotificationService.getInstance();
    this.connectionManager = ConnectionManager.getInstance();
    this.init();
  }

  /**
   * Initialize memory storage path
   */
  private init(): void {
    // Use a default path for memory storage in the agent server
    const defaultPath = process.cwd();
    this.filePath = path.join(defaultPath, '.codebolt', 'memory.json');
    const codeboltDir = path.dirname(this.filePath);
    
    if (!fs.existsSync(codeboltDir)) {
      fs.mkdirSync(codeboltDir, { recursive: true });
    }
  }

  /**
   * Handle memory events with actual implementation and response handling
   */
  async handleMemoryEvent(agent: ClientConnection, memoryEvent: MemoryEvent): Promise<void> {
    const { requestId, action } = memoryEvent;
    logger.info(formatLogMessage('info', 'MemoryHandler', `Handling memory event: ${action} from ${agent.id}`));
    
    try {
      // Send request notification to app
      const requestNotification: MemoryNotification = {
        requestId: requestId,
        toolUseId: requestId,
        type: 'dbmemorynotify',
        action: `${action}Request`,
        agentId: agent.id,
        data: {
          action: action,
          key: (memoryEvent as any).key,
          value: (memoryEvent as any).value
        }
      };

      this.notificationService.sendToAppRelatedToAgentId(agent.id, requestNotification as any);
      logger.info(formatLogMessage('info', 'MemoryHandler', `Sent memory request notification: ${action}`));

      // Execute the actual Memory operation based on action
      let operationResult;
      
      switch (action) {
        case 'set':
          operationResult = await this.handleMemorySet(memoryEvent as any);
          break;
          
        case 'get':
          operationResult = await this.handleMemoryGet(memoryEvent as any);
          break;
          
        default:
          throw new Error(`Unknown Memory action: ${action}`);
      }

      // Send successful response back to agent
      const response = {
        success: true,
        data: operationResult,
        type: 'memoryResponse',
        id: requestId,
        action: action
      };
      
      this.connectionManager.sendToConnection(agent.id, { ...response, clientId: agent.id });

      // Send success notification to app
      const successNotification: MemoryNotification = {
        requestId: requestId,
        toolUseId: requestId,
        type: 'dbmemorynotify',
        action: `${action}Result`,
        agentId: agent.id,
        data: {
          action: action,
          result: operationResult,
          key: (memoryEvent as any).key,
          value: (memoryEvent as any).value
        },
        isError: false
      };

      this.notificationService.sendToAppRelatedToAgentId(agent.id, successNotification as any);
      logger.info(formatLogMessage('info', 'MemoryHandler', `Sent memory success notification: ${action}`));

    } catch (error) {
      // Handle errors
      const errorResponse = {
        success: false,
        error: `Failed to execute memory operation: ${error}`,
        type: 'memoryResponse',
        id: requestId,
        action: action
      };

      this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });

      // Send error notification to app
      const errorNotification: MemoryNotification = {
        requestId: requestId,
        toolUseId: requestId,
        type: 'dbmemorynotify',
        action: `${action}Result`,
        agentId: agent.id,
        data: {
          action: action,
          error: `Error executing memory operation: ${error}`,
          key: (memoryEvent as any).key,
          value: (memoryEvent as any).value
        },
        isError: true
      };

      this.notificationService.sendToAppRelatedToAgentId(agent.id, errorNotification as any);
      logger.info(formatLogMessage('error', 'MemoryHandler', `Error processing memory event: ${action} - ${error}`));
    }
  }

  /**
   * Handle memory set operation
   * Based on memoryService.cli.ts set method
   */
  private async handleMemorySet(message: any): Promise<any> {
    try {
      if (!message.key || message.value === undefined) {
        throw new Error('Key and value are required for memory set operation');
      }

      await this.set(message.key, message.value);
      
      const result = {
        success: true,
        message: `Memory set for key: ${message.key}`,
        key: message.key,
        value: message.value
      };

      logger.info(formatLogMessage('info', 'MemoryHandler', `Set memory for key: ${message.key}`));
      return result;

    } catch (error) {
      logger.info(formatLogMessage('error', 'MemoryHandler', `Error setting memory: ${error}`));
      throw error;
    }
  }

  /**
   * Handle memory get operation
   * Based on memoryService.cli.ts get method
   */
  private async handleMemoryGet(message: any): Promise<any> {
    try {
      if (!message.key) {
        throw new Error('Key is required for memory get operation');
      }

      const value = await this.get(message.key);
      
      const result = {
        success: true,
        data: value,
        message: `Memory retrieved for key: ${message.key}`,
        key: message.key,
        value: value
      };

      logger.info(formatLogMessage('info', 'MemoryHandler', `Retrieved memory for key: ${message.key}`));
      return result;

    } catch (error) {
      logger.info(formatLogMessage('error', 'MemoryHandler', `Error getting memory: ${error}`));
      throw error;
    }
  }

  /**
   * Set memory value for a key
   * Based on memoryService.cli.ts set method
   */
  private async set(key: string, value: any): Promise<void> {
    if (!this.filePath) {
      throw new Error("Memory storage not initialized");
    }

    let data: any = {};
    
    if (fs.existsSync(this.filePath)) {
      const fileContent = fs.readFileSync(this.filePath, 'utf8');
      try {
        data = JSON.parse(fileContent);
      } catch (parseError) {
        logger.info(formatLogMessage('warn', 'MemoryHandler', `Failed to parse existing memory file, creating new: ${parseError}`));
        data = {};
      }
    }
    
    data[key] = value;
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  /**
   * Get memory value for a key  
   * Based on memoryService.cli.ts get method
   */
  private async get(key: string): Promise<any> {
    if (!this.filePath) {
      throw new Error("Memory storage not initialized");
    }

    if (!fs.existsSync(this.filePath)) {
      return null;
    }
    
    const fileContent = fs.readFileSync(this.filePath, 'utf8');
    try {
      const data = JSON.parse(fileContent);
      return data[key] || null;
    } catch (parseError) {
      logger.info(formatLogMessage('error', 'MemoryHandler', `Failed to parse memory file: ${parseError}`));
      return null;
    }
  }
}
