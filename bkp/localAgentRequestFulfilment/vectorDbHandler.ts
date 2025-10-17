import {
  ClientConnection,
  formatLogMessage
} from '../types';  
import { NotificationService } from '../services/NotificationService.js';
import type { VectordbEvent, DbMemoryNotificationBase } from '@codebolt/types/agent-to-app-ws-types';
import { ConnectionManager } from '../core/connectionManagers/connectionManager.js';
// @ts-ignore - External dependency, type declarations may not be available
import { LocalIndex } from 'cbvectordb';
// @ts-ignore - External dependency, type declarations may not be available  
import Multillm from '@arrowai/multillm';
import path from 'path';
import { logger } from '../utils/logger';

// Extend the base interface to include data property and isError
interface VectorDbNotification extends DbMemoryNotificationBase {
  data?: {
    action?: string;
    result?: any;
    error?: string;
    [key: string]: any;
  };
  isError?: boolean;
}

/**
 * Handles VectorDB events with actual implementation using cbvectordb and multillm
 * Based on vectordbService.ts from the main CodeBolt application
 */
export class VectorDbHandler {
  private notificationService: NotificationService;
  private connectionManager: ConnectionManager;
  private index: LocalIndex | null = null;

  constructor() {
    this.notificationService = NotificationService.getInstance();
    this.connectionManager = ConnectionManager.getInstance();
  }

  /**
   * Create and initialize the vector database index
   */
  private async createIndex(dbPath?: string): Promise<void> {
    try {
      // Initialize index if not already initialized
      if (!this.index) {
        if (dbPath) {
          this.index = new LocalIndex(dbPath);
        } else {
          // Use a default path if none provided
          const defaultPath = path.join(process.cwd(), '.codebolt', 'vectordb');
          this.index = new LocalIndex(defaultPath);
        }
      }
      
      // Check if index exists and create if not
      if (this.index && !(await this.index.isIndexCreated())) {
        await this.index.createIndex();
      }
    } catch (error) {
      logger.info(formatLogMessage('error', 'VectorDbHandler', `Error creating index: ${error}`));
      throw error;
    }
  }

  /**
   * Get vector embeddings for text using LLM
   * Simplified version of the main app's implementation
   */
  private async getVector(text: string): Promise<any> {
    try {
      // Default LLM configuration - in production this should come from settings
      const defaultConfig = {
        provider: 'openai',
        model: 'text-embedding-ada-002',
        apiKey: process.env.OPENAI_API_KEY,
        apiUrl: null,
        embeddingModel: 'text-embedding-ada-002'
      };

      logger.info(formatLogMessage('info', 'VectorDbHandler', `Getting vector for text using: ${defaultConfig.provider}, ${defaultConfig.embeddingModel}`));
      
      // Create Multillm instance
      const api = new Multillm(
        defaultConfig.provider as any, 
        defaultConfig.model, 
        null, // device_map
        defaultConfig.apiKey || null, 
        defaultConfig.apiUrl
      );
      
      try {
        // Get embeddings
        const anyApi = api as any;
        const response = await anyApi.instance.createEmbedding(text, defaultConfig.embeddingModel);
        
        if (!response || !response.data) {
          throw new Error("No valid response from embedding API");
        }
        
        return response;
      } catch (error) {
        logger.info(formatLogMessage('error', 'VectorDbHandler', `Error calling embedding API: ${error}`));
        throw error;
      }
    } catch (error) {
      logger.info(formatLogMessage('error', 'VectorDbHandler', `Error in getVector: ${error}`));
      throw error;
    }
  }

  /**
   * Handle VectorDB events with actual implementation and response handling
   */
  async handleVectorDbEvent(agent: ClientConnection, vectorDbEvent: VectordbEvent): Promise<void> {
    const { requestId, action, message } = vectorDbEvent;
    logger.info(formatLogMessage('info', 'VectorDbHandler', `Handling vectordb event: ${action} from ${agent.id}`));
    
    try {
      // Send request notification to app
      const requestNotification: VectorDbNotification = {
        requestId: requestId,
        toolUseId: requestId,
        type: 'dbmemorynotify',
        action: `${action}Request`,
        agentId: agent.id,
        data: {
          action: action,
          ...message
        }
      };

      this.notificationService.sendToAppRelatedToAgentId(agent.id, requestNotification as any);
      logger.info(formatLogMessage('info', 'VectorDbHandler', `Sent vectordb request notification: ${action}`));

      // Execute the actual VectorDB operation based on action
      let operationResult;
      
      switch (action) {
        case 'addVectorItem':
          operationResult = await this.handleAddVectorItem(message);
          break;
          
        case 'getVector':
          operationResult = await this.handleGetVector(message);
          break;
          
        case 'queryVectorItem':
          operationResult = await this.handleQueryVectorItem(message);
          break;
          
        case 'queryVectorItems':
          operationResult = await this.handleQueryVectorItems(message);
          break;
          
        default:
          throw new Error(`Unknown VectorDB action: ${action}`);
      }

      // Send successful response back to agent
      const response = {
        success: true,
        data: operationResult,
        type: 'vectordbResponse',
        id: requestId,
        action: action
      };
      
      this.connectionManager.sendToConnection(agent.id, { ...response, clientId: agent.id });

      // Send success notification to app
      const successNotification: VectorDbNotification = {
        requestId: requestId,
        toolUseId: requestId,
        type: 'dbmemorynotify',
        action: `${action}Result`,
        agentId: agent.id,
        data: {
          action: action,
          result: operationResult,
          ...message
        },
        isError: false
      };

      this.notificationService.sendToAppRelatedToAgentId(agent.id, successNotification as any);
      logger.info(formatLogMessage('info', 'VectorDbHandler', `Sent vectordb success notification: ${action}`));

    } catch (error) {
      // Handle errors
      const errorResponse = {
        success: false,
        error: `Failed to execute vectordb operation: ${error}`,
        type: 'vectordbResponse',
        id: requestId,
        action: action
      };

      this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });

      // Send error notification to app
      const errorNotification: VectorDbNotification = {
        requestId: requestId,
        toolUseId: requestId,
        type: 'dbmemorynotify',
        action: `${action}Result`,
        agentId: agent.id,
        data: {
          action: action,
          error: `Error executing vectordb operation: ${error}`,
          ...message
        },
        isError: true
      };

      this.notificationService.sendToAppRelatedToAgentId(agent.id, errorNotification as any);
      logger.info(formatLogMessage('error', 'VectorDbHandler', `Error processing vectordb event: ${action} - ${error}`));
    }
  }

  /**
   * Handle addVectorItem operation
   * Based on vectordbService.ts addItem method
   */
  private async handleAddVectorItem(message: any): Promise<any> {
    try {
      if (!message.item) {
        throw new Error('Item is required for addVectorItem operation');
      }

      // Create index if not exists
      await this.createIndex();
      
      // Get vector embeddings for the text
      const vectorResponse = await this.getVector(message.item);
      
      if (!this.index) {
        throw new Error("Index not initialized");
      }
      
      // Extract embedding vector from response (handle different formats)
      const embedding = vectorResponse.data?.[0]?.embedding || 
                       vectorResponse.data || 
                       vectorResponse;
      
      // Insert item into vector database
      const result = await this.index.insertItem({
        vector: embedding,
        metadata: { text: message.item }
      });

      logger.info(formatLogMessage('info', 'VectorDbHandler', `Added item to vector database: ${result}`));
      
      return {
        success: true,
        message: 'Item added to vector database',
        item: message.item,
        result: result
      };

    } catch (error) {
      logger.info(formatLogMessage('error', 'VectorDbHandler', `Error adding item to vector database: ${error}`));
      throw error;
    }
  }

  /**
   * Handle getVector operation  
   * Based on vectordbService.ts getVector method
   */
  private async handleGetVector(message: any): Promise<any> {
    try {
      if (!message.item) {
        throw new Error('Item is required for getVector operation');
      }

      // Get vector embeddings for the text using LLM
      const vectorResponse = await this.getVector(message.item);

      logger.info(formatLogMessage('info', 'VectorDbHandler', `Retrieved vector for item: ${message.item}`));
      
      return {
        success: true,
        data: vectorResponse,
        message: 'Vector retrieved from LLM embedding service',
        item: message.item
      };

    } catch (error) {
      logger.info(formatLogMessage('error', 'VectorDbHandler', `Error getting vector: ${error}`));
      throw error;
    }
  }

  /**
   * Handle queryVectorItem operation
   * Based on vectordbService.ts queryItem method
   */
  private async handleQueryVectorItem(message: any): Promise<any> {
    try {
      if (!message.item && !message.query) {
        throw new Error('Item or query is required for queryVectorItem operation');
      }

      const queryText = message.item || message.query;

      // Create index if not exists
      await this.createIndex();
      
      if (!this.index) {
        throw new Error("Index not initialized");
      }
      
      // Get vector embeddings for the query text
      const vectorResponse = await this.getVector(queryText);
      
      // Extract embedding vector from response (handle different formats)
      const embedding = vectorResponse.data?.[0]?.embedding || 
                       vectorResponse.data || 
                       vectorResponse;
      
      // Query the vector database
      const results = await this.index.queryItems(embedding, 3);
      
      if (results.length > 0) {
        results.forEach((result: any) => {
          logger.info(formatLogMessage('info', 'VectorDbHandler', `[${result.score}] ${result.item.metadata.text}`));
        });
      } else {
        logger.info(formatLogMessage('info', 'VectorDbHandler', `No results found for query: ${queryText}`));
      }

      return {
        success: true,
        data: results,
        message: `Vector database queried with: ${queryText}`,
        query: queryText,
        resultCount: results.length
      };

    } catch (error) {
      logger.info(formatLogMessage('error', 'VectorDbHandler', `Error querying vector database: ${error}`));
      throw error;
    }
  }

  /**
   * Handle queryVectorItems operation
   * Based on vectordbService.ts queryItems method
   */
  private async handleQueryVectorItems(message: any): Promise<any> {
    try {
      if (!message.items) {
        throw new Error('Items array is required for queryVectorItems operation');
      }

      // Initialize index with the provided dbPath (if any)
      await this.createIndex(message.dbPath);
      
      if (!this.index) {
        throw new Error("Index not initialized");
      }
      
      // Process multiple items and query for each
      const queryItems = await Promise.all(
        message.items.map(async (item: string) => {
          try {
            // Get vector embeddings for each item
            const vectorResponse = await this.getVector(item);
            
            // Extract embedding vector from response
            const embedding = vectorResponse.data?.[0]?.embedding || 
                             vectorResponse.data || 
                             vectorResponse;
            
            // Query the vector database for this item
            const retrieved = await this.index!.queryItems(embedding, 10);
            
            return {
              icon: item,
              retrieved: retrieved.slice(1).map((e: any) => e.item.metadata.name || e.item.metadata.text),
              originalQuery: item,
              resultCount: retrieved.length
            };
          } catch (itemError) {
            logger.info(formatLogMessage('error', 'VectorDbHandler', `Error processing item ${item}: ${itemError}`));
            return {
              icon: item,
              retrieved: [],
              originalQuery: item,
              error: `Error processing item: ${itemError}`,
              resultCount: 0
            };
          }
        })
      );

      logger.info(formatLogMessage('info', 'VectorDbHandler', `Queried vector database with ${message.items.length} items`));
      
      return {
        success: true,
        data: queryItems,
        message: `Vector database queried with ${message.items.length} items`,
        items: message.items,
        dbPath: message.dbPath,
        processedCount: queryItems.length
      };

    } catch (error) {
      logger.info(formatLogMessage('error', 'VectorDbHandler', `Error querying vector database items: ${error}`));
      throw error;
    }
  }
}
