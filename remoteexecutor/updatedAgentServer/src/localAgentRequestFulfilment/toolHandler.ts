import type { ClientConnection } from "../types";
import { ConnectionManager } from "../core/connectionManagers/connectionManager.js";
import { logger } from "../utils/logger";
import { StandaloneToolsFramework } from "../codeboltTools/index";
import { PermissionManager, PermissionUtils } from "./PermissionManager";

import type {
  GetEnabledToolBoxesEvent,
  GetLocalToolBoxesEvent,
  GetAvailableToolBoxesEvent,
  SearchAvailableToolBoxesEvent,
  ListToolsFromToolBoxesEvent,
  ConfigureToolBoxEvent,
  GetToolsEvent,
  ExecuteToolEvent,
  McpEvent
} from '@codebolt/types/wstypes/agent-to-app-ws/actions/mcpEventSchemas'

import type {
   CreateFileSuccessResponse ,
   CreateFileErrorResponse,
   CreateFolderSuccessResponse ,
   CreateFolderErrorResponse,
   ReadFileSuccessResponse ,
   ReadFileSuccessResultResponse ,
   UpdateFileSuccessResponse ,
   UpdateFileErrorResponse ,
   DeleteFileSuccessResponse ,
   DeleteFileErrorResponse ,
   DeleteFolderSuccessResponse ,
   DeleteFolderErrorResponse ,
   FileListSuccessResponse ,
   FileListErrorResponse ,
   SearchFilesSuccessResponse ,
   SearchFilesErrorResponse ,
   WriteToFileSuccessResponse ,
   WriteToFileErrorResponse,
   GrepSearchSuccessResponse ,
   GrepSearchErrorResponse ,
   ListCodeDefinitionNamesSuccessResponse ,
   ListCodeDefinitionNamesErrorResponse ,
   FileSearchSuccessResponse ,
   FileSearchErrorResponse,
   EditFileAndApplyDiffSuccessResponse,
   EditFileAndApplyDiffErrorResponse,
   FsServiceResponse 
} from "@codebolt/types/wstypes/app-to-agent-ws/fsServiceResponses"

import type {
   GetEnabledToolBoxesResponse ,
   GetLocalToolBoxesResponse,
   GetAvailableToolBoxesResponse,
   SearchAvailableToolBoxesResponse,
   ListToolsFromToolBoxesResponse ,
   ConfigureToolBoxResponse ,
   GetToolsResponse ,
   ExecuteToolResponse,
   MCPServiceResponse ,
} from '@codebolt/types/wstypes/app-to-agent-ws/mcpServiceResponses'
import { lookup } from "dns";


export class ToolHandler {
  private connectionManager = ConnectionManager.getInstance();
  private permissionManager: PermissionManager;
  private toolsFramework: StandaloneToolsFramework;

  constructor() {
    // Initialize StandaloneToolsFramework with proper configuration
    logger.info('Initializing StandaloneToolsFramework...');
    this.toolsFramework = new StandaloneToolsFramework({
      targetDir: process.cwd(),
      workspaceDirectories: [process.cwd()],
      debugMode: process.env.NODE_ENV === 'development',
      approvalMode: 'auto',
      timeout: 30000 // 30 seconds timeout
    });
      
    // Initialize PermissionManager
    this.permissionManager = PermissionManager.getInstance();
    this.permissionManager.initialize();
    
    const toolCount = this.toolsFramework.getRegistry().size();
    logger.info(`StandaloneToolsFramework initialized with ${toolCount} tools`);
  }

  /**
   * Ensure the tools framework is properly initialized
   */
  private ensureFrameworkReady(): void {
    if (!this.toolsFramework) {
      throw new Error('StandaloneToolsFramework not initialized');
    }
    
    const toolCount = this.toolsFramework.getRegistry().size();
    if (toolCount === 0) {
      logger.warn('No tools registered in the framework');
    }
  }

  async handleToolEvent(agent: ClientConnection, event: GetEnabledToolBoxesEvent | GetLocalToolBoxesEvent | GetAvailableToolBoxesEvent | SearchAvailableToolBoxesEvent | ListToolsFromToolBoxesEvent | ConfigureToolBoxEvent | GetToolsEvent | ExecuteToolEvent): Promise<void> {
    try {
      switch (event.action) {
        case 'getEnabledToolBoxes':
          await this.handleGetEnabledToolBoxes(agent, event as GetEnabledToolBoxesEvent);
          break;
        
        case 'getLocalToolBoxes':
          await this.handleGetLocalToolBoxes(agent, event as GetLocalToolBoxesEvent);
          break;
        
        case 'getAvailableToolBoxes':
          await this.handleGetAvailableToolBoxes(agent, event as GetAvailableToolBoxesEvent);
          break;
        
        case 'searchAvailableToolBoxes':
          await this.handleSearchAvailableToolBoxes(agent, event as SearchAvailableToolBoxesEvent);
          break;
        
        case 'listToolsFromToolBoxes':
          await this.handleListToolsFromToolBoxes(agent, event as ListToolsFromToolBoxesEvent);
          break;
        
        case 'configureToolBox':
          await this.handleConfigureToolBox(agent, event as ConfigureToolBoxEvent);
          break;
        
        case 'getTools':
          await this.handleGetTools(agent, event as GetToolsEvent);
          break;
        
        case 'executeTool':
          await this.handleExecuteTool(agent, event as ExecuteToolEvent);
          break;
        
        default:
          logger.warn(`Unknown tool event action: ${(event as any).action}`);
          break;
      }
    } catch (error) {
      logger.error(`Error handling tool event: ${error}`);
      // Send generic error response back to agent
      this.connectionManager.sendToConnection(agent.id, {
        type: 'error',
        requestId: event.requestId,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      });
    }
  }

  /**
   * Handle tool execution events with proper confirmation handling
   */
  async handleToolExecution(agent: ClientConnection, event: {
    type: string;
    action: string;
    requestId: string;
    toolName: string;
    params: any;
    messageId?: string;
    threadId?: string;
    agentInstanceId?: string;
    agentId?: string;
    parentAgentInstanceId?: string;
    parentId?: string;
  }): Promise<void> {
    try {
      // Ensure framework is ready before executing
      this.ensureFrameworkReady();

      // Execute tool using the framework by tool name
      const abortController = new AbortController();
      const result = await this.toolsFramework.getRegistry().executeTool(
        event.toolName,
        event.params,
        abortController.signal
      );
      
      // Send success response
      this.connectionManager.sendToConnection(agent.id, {
        type: 'toolResponse',
        requestId: event.requestId,
        success: true,
        toolName: event.toolName,
        result: result,
      });
    } catch (error) {
      logger.error(`Error handling tool execution: ${error}`);
      this.connectionManager.sendToConnection(agent.id, {
        type: 'toolResponse',
        requestId: event.requestId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }

  private async handleGetEnabledToolBoxes(agent: ClientConnection, event: GetEnabledToolBoxesEvent): Promise<void> {
    logger.info(`Handling getEnabledToolBoxes event: ${event.requestId}`);
    
    try {
      // Get enabled toolboxes from registry
      const enabledTools = this.toolsFramework.getRegistry().getAllTools();
      
      const response: GetEnabledToolBoxesResponse = {
        type: 'getEnabledToolBoxesResponse',
        data: enabledTools.map(tool => ({
          name: tool.name,
          displayName: tool.displayName,
          description: tool.description,
          kind: tool.kind
        })),
        success: true,
        message: `Found ${enabledTools.length} enabled toolboxes`
      };
      
      this.connectionManager.sendToConnection(agent.id, response);
    } catch (error) {
      logger.error(`Error getting enabled toolboxes: ${error}`);
      const errorResponse: GetEnabledToolBoxesResponse = {
        type: 'getEnabledToolBoxesResponse',
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get enabled toolboxes'
      };
      this.connectionManager.sendToConnection(agent.id, errorResponse);
    }
  }

  private async handleGetLocalToolBoxes(agent: ClientConnection, event: GetLocalToolBoxesEvent): Promise<void> {
    logger.info(`Handling getLocalToolBoxes event: ${event.requestId}`);
    
    try {
      // Get local toolboxes from registry
      const localTools = this.toolsFramework.getRegistry().getAllTools();
      
      const response: GetLocalToolBoxesResponse = {
        type: 'getLocalToolBoxesResponse',
        data: localTools.map(tool => ({
          name: tool.name,
          displayName: tool.displayName,
          description: tool.description,
          kind: tool.kind
        })),
        success: true,
        message: `Found ${localTools.length} local toolboxes`
      };
      
      this.connectionManager.sendToConnection(agent.id, response);
    } catch (error) {
      logger.error(`Error getting local toolboxes: ${error}`);
      const errorResponse: GetLocalToolBoxesResponse = {
        type: 'getLocalToolBoxesResponse',
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get local toolboxes'
      };
      this.connectionManager.sendToConnection(agent.id, errorResponse);
    }
  }

  private async handleGetAvailableToolBoxes(agent: ClientConnection, event: GetAvailableToolBoxesEvent): Promise<void> {
    logger.info(`Handling getAvailableToolBoxes event: ${event.requestId}`);
    
    try {
      // Get available toolboxes from registry
      const availableTools = this.toolsFramework.getRegistry().getAllTools();
      
      const response: GetAvailableToolBoxesResponse = {
        type: 'getAvailableToolBoxesResponse',
        data: availableTools.map(tool => ({
          name: tool.name,
          displayName: tool.displayName,
          description: tool.description,
          kind: tool.kind
        })),
        success: true,
        message: `Found ${availableTools.length} available toolboxes`
      };
      
      this.connectionManager.sendToConnection(agent.id, response);
    } catch (error) {
      logger.error(`Error getting available toolboxes: ${error}`);
      const errorResponse: GetAvailableToolBoxesResponse = {
        type: 'getAvailableToolBoxesResponse',
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get available toolboxes'
      };
      this.connectionManager.sendToConnection(agent.id, errorResponse);
    }
  }

  private async handleSearchAvailableToolBoxes(agent: ClientConnection, event: SearchAvailableToolBoxesEvent): Promise<void> {
    logger.info(`Handling searchAvailableToolBoxes event: ${event.requestId}, query: ${event.query}`);
    
    try {
      // Get all available tool schemas from the registry
      const toolSchemas = this.toolsFramework.getRegistry().getOpenAIToolSchemas();
      
      // Filter tools based on the search query
      const filteredTools = toolSchemas.filter(tool => {
        const searchQuery = event.query.toLowerCase();
        return (
          tool.function.name.toLowerCase().includes(searchQuery) ||
          tool.function.description?.toLowerCase().includes(searchQuery) ||
          false
        );
      });
      
      const response: SearchAvailableToolBoxesResponse = {
        type: 'searchAvailableToolBoxesResponse',
        data: {
          query: event.query,
          results: filteredTools.map(tool => ({
            name: tool.function.name,
            description: tool.function.description,
            parameters: tool.function.parameters
          })),
          totalCount: filteredTools.length
        },
        success: true,
        message: `Found ${filteredTools.length} tools matching '${event.query}'`
      };
      
      this.connectionManager.sendToConnection(agent.id, response);
    } catch (error) {
      logger.error(`Error searching available toolboxes: ${error}`);
      const errorResponse: SearchAvailableToolBoxesResponse = {
        type: 'searchAvailableToolBoxesResponse',
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search toolboxes'
      };
      this.connectionManager.sendToConnection(agent.id, errorResponse);
    }
  }

  private async handleListToolsFromToolBoxes(agent: ClientConnection, event: ListToolsFromToolBoxesEvent): Promise<void> {
    logger.info(`Handling listToolsFromToolBoxes event: ${event.requestId}, toolBoxes: ${event.toolBoxes.join(', ')}`);
    
    try {
      // Get tools from specified toolboxes
      const allTools = this.toolsFramework.getRegistry().getOpenAIToolSchemas()
      // logger.info("allTools",allTools)
    
      
      const response: ListToolsFromToolBoxesResponse = {
        type: 'listToolsFromToolBoxesResponse',
        data: allTools,
        success: true,
        message: `Found ${allTools.length} tools from specified toolboxes`,
        requestId: event.requestId
      };
      
      this.connectionManager.sendToConnection(agent.id, response);
    } catch (error) {
      logger.error(`Error listing tools from toolboxes: ${error}`);
      const errorResponse: ListToolsFromToolBoxesResponse = {
        type: 'listToolsFromToolBoxesResponse',
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list tools from toolboxes'
      };
      this.connectionManager.sendToConnection(agent.id, errorResponse);
    }
  }

  private async handleConfigureToolBox(agent: ClientConnection, event: ConfigureToolBoxEvent): Promise<void> {
    logger.info(`Handling configureToolBox event: ${event.requestId}, mcpName: ${event.mcpName}`);
    
    try {
      // Configure toolbox logic would go here
      // For now, we'll just acknowledge the configuration
      
      const response: ConfigureToolBoxResponse = {
        type: 'configureToolBoxResponse',
        configuration: event.config,
        data: {
          mcpName: event.mcpName,
          configured: true,
          timestamp: new Date().toISOString()
        },
        success: true,
        message: `Successfully configured toolbox: ${event.mcpName}`
      };
      
      this.connectionManager.sendToConnection(agent.id, response);
    } catch (error) {
      logger.error(`Error configuring toolbox: ${error}`);
      const errorResponse: ConfigureToolBoxResponse = {
        type: 'configureToolBoxResponse',
        success: false,
        error: error instanceof Error ? error.message : 'Failed to configure toolbox'
      };
      this.connectionManager.sendToConnection(agent.id, errorResponse);
    }
  }

  private async handleGetTools(agent: ClientConnection, event: GetToolsEvent): Promise<void> {
    logger.info(`Handling getTools event: ${event.requestId}, toolboxes: ${event.toolboxes.length}`);
    
    try {
      // Get tools from specified toolboxes
      const toolNames = event.toolboxes.map(tb => tb.toolName);
      const toolSchemas = this.toolsFramework.getRegistry().getToolSchemasFiltered(toolNames);
      
      const response: GetToolsResponse = {
        type: 'getToolsResponse',
        tools: toolSchemas.map(schema => ({
          name: schema.function.name,
          description: schema.function.description || '',
          parameters: schema.function.parameters || {}
        })),
        data: toolSchemas,
        success: true,
        message: `Retrieved ${toolSchemas.length} tools from specified toolboxes`
      };
      
      this.connectionManager.sendToConnection(agent.id, response);
    } catch (error) {
      logger.error(`Error getting tools: ${error}`);
      const errorResponse: GetToolsResponse = {
        type: 'getToolsResponse',
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get tools'
      };
      this.connectionManager.sendToConnection(agent.id, errorResponse);
    }
  }

  private async handleExecuteTool(agent: ClientConnection, event: ExecuteToolEvent): Promise<void> {
    logger.info(`Handling executeTool event: ${event.requestId}, toolName: ${event.toolName}`);
    
    try {
      // Ensure framework is ready before executing
      this.ensureFrameworkReady();
      
      // Execute the tool using the registry
      const abortController = new AbortController();
      const result = await this.toolsFramework.getRegistry().executeTool(
        event.toolName.startsWith("codebolt--") ? event.toolName.replace(/^codebolt--/, "") : event.toolName,
        event.params,
        abortController.signal
      );
      
      const response: ExecuteToolResponse = {
        type: 'executeToolResponse',
        toolName: event.toolName.startsWith("codebolt--") ? event.toolName.replace(/^codebolt--/, "") : event.toolName,
        params: event.params,
        result: result,
        data: [true, result],
        status: 'success',
        success: true,
        message: `Successfully executed tool: ${event.toolName}`
      };

      logger.info("response from tool",response)
      
      this.connectionManager.sendToConnection(agent.id, response);
    } catch (error) {
      logger.error(`Error executing tool: ${error}`);
      const errorResponse: ExecuteToolResponse = {
        type: 'executeToolResponse',
        toolName: event.toolName,
        status: 'error',
        success: false,
        error: error instanceof Error ? error.message : 'Failed to execute tool',
        data: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
      this.connectionManager.sendToConnection(agent.id, errorResponse);
    }
  }









}