/**
 * @fileoverview Main ComposableAgent implementation
 * @description Core agent class that provides a composable API for creating and running agents
 */

import codeboltjs from '@codebolt/codeboltjs';
// Use all relevant CodeBolt APIs
const { chat, llm, mcp, fs } = codeboltjs;

import type {
  ComposableAgentConfig,
  ComposableAgent as IComposableAgent,
  Message,
  ExecutionResult,
  ExecutionContext,
  StreamCallback,
  StreamChunk,
  ToolCall,
  Tool,

  CodeBoltMessage,
  AgentProcessingConfig
} from './types';

import { createDefaultTools, executeTool, toolsToOpenAIFunctions } from './tool';
import { Memory } from './memory';
// Import codeboltjs for accessing user message
// The user message is now automatically saved by codeboltjs.onMessage()

/**
 * Main ComposableAgent class that provides a simple, composable API for creating agents
 */
export class ComposableAgent implements IComposableAgent {
  public readonly config: ComposableAgentConfig;
  private conversation: Message[] = [];
  private memory?: Memory;
  private tools: Record<string, Tool>;

  constructor(config: ComposableAgentConfig) {
    this.config = {
      maxTurns: 10,
      ...config
    };

    // Merge user tools with default tools
    this.tools = {
      ...createDefaultTools(),
      ...(config.tools || {})
    };

    this.memory = config.memory;

    // Initialize conversation with system message
    this.conversation = [
      {
        role: 'system',
        content: config.instructions,
        timestamp: new Date().toISOString()
      }
    ];
  }

  /**
   * Run the agent using globally saved user context from codeboltjs
   * This is the main method to use within codebolt.onMessage()
   * 
   * @param options - Execution options
   * @returns Promise<ExecutionResult>
   */
  async run(
    options: { stream?: boolean; callback?: StreamCallback } = {}
  ): Promise<ExecutionResult> {
    // Get user message from codeboltjs (automatically saved by onMessage)
    const userMessage = (codeboltjs as any).userMessage?.getCurrent();
    
    if (!userMessage) {
      throw new Error('No user message found. Make sure this is called within codebolt.onMessage()');
    }

    // Convert to CodeBoltMessage format
    const codeboltMessage: CodeBoltMessage = {
      userMessage: userMessage.userMessage,
      mentionedFiles: [
        ...(userMessage.mentionedFiles || []),
        ...(userMessage.mentionedFullPaths || [])
      ],
      mentionedMCPs: userMessage.mentionedMCPs || [],
      mentionedAgents: userMessage.mentionedAgents || [],
      remixPrompt: userMessage.remixPrompt
    };

    return this.executeMessage(codeboltMessage, options);
  }

  /**
   * Execute a task with the agent using a simple string message
   * 
   * @param message - User message to process
   * @param options - Execution options
   * @returns Promise<ExecutionResult>
   */
  async execute(
    message: string, 
    options: { stream?: boolean; callback?: StreamCallback } = {}
  ): Promise<ExecutionResult> {
    // Convert string to CodeBoltMessage format
    const codeboltMessage: CodeBoltMessage = {
      userMessage: message,
      mentionedFiles: [],
      mentionedMCPs: [],
      mentionedAgents: []
    };
    
    return this.executeMessage(codeboltMessage, options);
  }

  /**
   * Execute a task with the agent using CodeBolt Message format
   * 
   * @param message - CodeBolt message with enhanced features
   * @param options - Execution options
   * @returns Promise<ExecutionResult>
   */
  async executeMessage(
    message: CodeBoltMessage, 
    options: { stream?: boolean; callback?: StreamCallback } = {}
  ): Promise<ExecutionResult> {
    const { stream = false, callback } = options;

    try {
      // Process the CodeBolt message and enhance the agent
      await this.processCodeBoltMessage(message);

      // Create user message for conversation
      let messageContent = message.userMessage;
      
      // Add file content if processing enabled
      if (this.config.processing?.processMentionedFiles && message.mentionedFiles?.length) {
        const fileContents = await this.processFiles(message.mentionedFiles);
        if (fileContents.length > 0) {
          messageContent += '\n\nReferenced files:\n' + fileContents.join('\n\n');
        }
      }

      const userMessage: Message = {
        role: 'user',
        content: messageContent,
        timestamp: new Date().toISOString()
      };

      this.addMessage(userMessage);

      let turnCount = 0;
      let completed = false;
      let lastAssistantMessage = '';

      while (!completed && turnCount < (this.config.maxTurns || 10)) {
        turnCount++;

        if (stream && callback) {
          await callback({
            type: 'text',
            content: `\n--- Turn ${turnCount} ---\n`
          });
        }

        // Make LLM request
        const response = await this.makeLLMRequest();

        if (!response || !response.choices || response.choices.length === 0) {
          throw new Error('No response from LLM');
        }

        const choice = response.choices[0];
        const assistantMessage = choice.message;

        if (!assistantMessage) {
          throw new Error('No message in LLM response');
        }

        // Add assistant message to conversation
        this.addMessage(assistantMessage);

        // Store content for return
        if (assistantMessage.content) {
          lastAssistantMessage = Array.isArray(assistantMessage.content)
            ? assistantMessage.content.map((c: any) => c.text || '').join('')
            : assistantMessage.content;
        }

        // Send message to chat if it has content
        if (lastAssistantMessage && !stream) {
          await chat.sendMessage(lastAssistantMessage, {});
        }

        if (stream && callback && lastAssistantMessage) {
          await callback({
            type: 'text',
            content: lastAssistantMessage
          });
        }

        // Handle tool calls
        if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
          const toolResults: Message[] = [];

          for (const toolCall of assistantMessage.tool_calls) {
            if (stream && callback) {
              await callback({
                type: 'tool_call',
                content: `Calling tool: ${toolCall.function.name}`,
                tool_call: toolCall
              });
            }

            const result = await this.executeToolCall(toolCall);
            toolResults.push(result);

            if (stream && callback) {
              await callback({
                type: 'tool_result',
                content: result.content as string,
                tool_call: toolCall
              });
            }

            // Check if task was completed
            if (toolCall.function.name === 'attempt_completion') {
              completed = true;
            }
          }

          // Add tool results to conversation
          toolResults.forEach(result => this.addMessage(result));
        } else {
          // No tool calls, assume we need to continue or complete
          const continueMessage: Message = {
            role: 'user',
            content: 'If you have completed the task, use the attempt_completion tool. If you need more information, use the ask_followup_question tool. Otherwise, continue with the next step.',
            timestamp: new Date().toISOString()
          };
          this.addMessage(continueMessage);
        }
      }

      // Save conversation to memory if configured
      if (this.memory) {
        await this.saveConversation();
      }

      return {
        success: completed || turnCount >= (this.config.maxTurns || 10),
        message: lastAssistantMessage,
        conversation: [...this.conversation],
        metadata: {
          turnCount,
          completed,
          toolsUsed: this.getUsedTools()
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        conversation: [...this.conversation]
      };
    }
  }

  /**
   * Add a message to the conversation
   * 
   * @param message - Message to add
   */
  addMessage(message: Message): void {
    this.conversation.push({
      ...message,
      timestamp: message.timestamp || new Date().toISOString()
    });
  }

  /**
   * Get conversation history
   * 
   * @returns Array of messages
   */
  getConversation(): Message[] {
    return [...this.conversation];
  }

  /**
   * Clear conversation history (keeps system message)
   */
  clearConversation(): void {
    const systemMessage = this.conversation.find(msg => msg.role === 'system');
    this.conversation = systemMessage ? [systemMessage] : [];
  }

  /**
   * Save conversation to memory
   */
  async saveConversation(): Promise<void> {
    if (!this.memory) return;
    await this.memory.saveMessages(this.conversation);
  }

  /**
   * Load conversation from memory
   */
  async loadConversation(): Promise<void> {
    if (!this.memory) return;
    const messages = await this.memory.loadMessages();
    if (messages.length > 0) {
      this.conversation = messages;
    }
  }

  /**
   * Make a request to the LLM
   * 
   * @returns LLM response
   */
  private async makeLLMRequest(): Promise<any> {
    try {
      // Prepare messages for API
      const apiMessages = this.conversation.map(msg => ({
        role: msg.role,
        content: msg.content,
        tool_calls: msg.tool_calls,
        tool_call_id: msg.tool_call_id
      }));

      // Prepare tools for API
      const openAITools = toolsToOpenAIFunctions(this.tools);

      const createParams = {
        full: true,
        messages: apiMessages,
        tools: openAITools,
        tool_choice: 'auto',
        llmrole: this.config.model // Use model name as llmrole for CodeBolt inference
      };

      // Use CodeBolt's LLM inference API - no custom logic needed
      const { completion } = await llm.inference(createParams);
      return completion;

    } catch (error) {
      console.error('LLM request failed:', error);
      throw error;
    }
  }

  /**
   * Execute a tool call
   * 
   * @param toolCall - Tool call to execute
   * @returns Tool result message
   */
  private async executeToolCall(toolCall: ToolCall): Promise<Message> {
    try {
      const toolName = toolCall.function.name;
      
      // Parse arguments
      let args;
      try {
        args = JSON.parse(toolCall.function.arguments);
      } catch (error) {
        return {
          role: 'tool',
          tool_call_id: toolCall.id,
          content: `Error: Invalid tool arguments: ${toolCall.function.arguments}`,
          timestamp: new Date().toISOString()
        };
      }

      // Check if this is a custom tool first
      if (this.tools[toolName]) {
        const result = await executeTool(this.tools[toolName], args, this);
        return {
          role: 'tool',
          tool_call_id: toolCall.id,
          content: result.success 
            ? JSON.stringify(result.result)
            : `Error: ${result.error}`,
          timestamp: new Date().toISOString()
        };
      }

      // Try to execute as MCP tool using CodeBolt API
      try {
        // Parse toolbox--toolName format or guess structure
        let toolbox: string, actualToolName: string;
        
        if (toolName.includes('--')) {
          [toolbox, actualToolName] = toolName.split('--');
        } else if (toolName.includes('_')) {
          // Handle tool_name format
          const parts = toolName.split('_');
          toolbox = parts[0];
          actualToolName = parts.slice(1).join('_');
        } else {
          // Assume single word tools belong to 'codebolt' toolbox
          toolbox = 'codebolt';
          actualToolName = toolName;
        }

        const mcpResult = await mcp.executeTool(toolbox, actualToolName, args);
        
        return {
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(mcpResult.data || mcpResult),
          timestamp: new Date().toISOString()
        };

      } catch (mcpError) {
        // If MCP execution fails, return error
        return {
          role: 'tool',
          tool_call_id: toolCall.id,
          content: `Error: Tool '${toolName}' not found in custom tools or MCP toolboxes. ${(mcpError as Error).message}`,
          timestamp: new Date().toISOString()
        };
      }

    } catch (error) {
      return {
        role: 'tool',
        tool_call_id: toolCall.id,
        content: `Error: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get list of tools that were used in the conversation
   * 
   * @returns Array of tool names
   */
  private getUsedTools(): string[] {
    const usedTools = new Set<string>();
    
    for (const message of this.conversation) {
      if (message.tool_calls) {
        for (const toolCall of message.tool_calls) {
          usedTools.add(toolCall.function.name);
        }
      }
    }
    
    return Array.from(usedTools);
  }

  /**
   * Get available tools
   * 
   * @returns Record of available tools
   */
  getTools(): Record<string, Tool> {
    return { ...this.tools };
  }

  /**
   * Add a tool to the agent
   * 
   * @param name - Tool name
   * @param tool - Tool instance
   */
  addTool(name: string, tool: Tool): void {
    this.tools[name] = tool;
  }

  /**
   * Remove a tool from the agent
   * 
   * @param name - Tool name
   */
  removeTool(name: string): void {
    delete this.tools[name];
  }

  /**
   * Get execution context for tools
   * 
   * @returns ExecutionContext
   */
  getExecutionContext(): ExecutionContext {
    return {
      messages: [...this.conversation],
      tools: { ...this.tools },
      config: { ...this.config }
    };
  }

  /**
   * Process CodeBolt message and enhance agent capabilities
   * 
   * @param message - CodeBolt message to process
   */
  private async processCodeBoltMessage(message: CodeBoltMessage): Promise<void> {
    const processing = this.config.processing || {};
    const userConfig = (codeboltjs as any).userMessage?.getProcessingConfig() || {};

    // Merge agent config with global user config from codeboltjs
    const shouldProcessMCPs = processing.processMentionedMCPs ?? userConfig.processMentionedMCPs ?? false;
    const shouldProcessRemix = processing.processRemixPrompt ?? userConfig.processRemixPrompt ?? false;
    const shouldProcessAgents = processing.processMentionedAgents ?? userConfig.processMentionedAgents ?? false;

    // Process remix prompt to enhance system instructions
    if (shouldProcessRemix && message.remixPrompt) {
      await this.processRemixPrompt(message.remixPrompt);
    }

    // Process mentioned MCPs and add as tools
    if (shouldProcessMCPs && message.mentionedMCPs.length > 0) {
      await this.processMCPs(message.mentionedMCPs);
    }

    // Process mentioned agents and add as sub-agent tools
    if (shouldProcessAgents && message.mentionedAgents.length > 0) {
      await this.processAgents(message.mentionedAgents);
    }
  }

  /**
   * Process remix prompt and enhance system instructions
   * 
   * @param remixPrompt - Additional instructions to add to system prompt
   */
  private async processRemixPrompt(remixPrompt: string): Promise<void> {
    // Find the system message and enhance it
    const systemMessageIndex = this.conversation.findIndex(msg => msg.role === 'system');
    if (systemMessageIndex !== -1) {
      const currentSystemMessage = this.conversation[systemMessageIndex];
      const enhancedContent = `${currentSystemMessage.content}\n\n--- Enhanced Instructions ---\n${remixPrompt}`;
      
      this.conversation[systemMessageIndex] = {
        ...currentSystemMessage,
        content: enhancedContent,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Process mentioned MCP tools and add them to available tools
   * 
   * @param mentionedMCPs - List of MCP tools to process
   */
  private async processMCPs(mentionedMCPs: { toolbox: string, toolName: string }[]): Promise<void> {
    const processing = this.config.processing || {};

    for (const mcp of mentionedMCPs) {
      try {
        let tool: Tool | null = null;

        // Use custom processor if provided
        if (processing.mcpToolProcessor) {
          tool = await processing.mcpToolProcessor(mcp.toolbox, mcp.toolName);
        } else {
          // Default MCP processing - create a generic tool
          tool = this.createMCPTool(mcp.toolbox, mcp.toolName);
        }

        if (tool) {
          this.tools[`${mcp.toolbox}--${mcp.toolName}`] = tool;
        }
      } catch (error) {
        console.warn(`Failed to process MCP tool ${mcp.toolbox}--${mcp.toolName}:`, error);
      }
    }
  }

  /**
   * Create a generic MCP tool wrapper
   * 
   * @param toolbox - MCP toolbox name
   * @param toolName - MCP tool name
   * @returns Tool instance
   */
  private createMCPTool(toolbox: string, toolName: string): Tool {
    return {
      id: `${toolbox}--${toolName}`,
      description: `MCP tool ${toolName} from ${toolbox} toolbox`,
      inputSchema: require('zod').record(require('zod').any()),
      outputSchema: require('zod').any(),
      validateInput: (input: unknown) => input,
      validateOutput: (output: unknown) => output,
      execute: async ({ context }) => {
        // Use CodeBolt's MCP system to execute the tool
        const { mcp } = codeboltjs;
        const result = await mcp.executeTool(toolbox, toolName, context);
        return result.data || result;
      }
    };
  }

  /**
   * Process mentioned agents and add them as sub-agent tools
   * 
   * @param mentionedAgents - List of agents to process
   */
  private async processAgents(mentionedAgents: any[]): Promise<void> {
    for (const agent of mentionedAgents) {
      try {
        const agentTool = this.createSubAgentTool(agent);
        this.tools[`subagent--${agent.unique_id || agent.id}`] = agentTool;
      } catch (error) {
        console.warn(`Failed to process sub-agent ${agent.unique_id || agent.id}:`, error);
      }
    }
  }

  /**
   * Create a sub-agent tool wrapper
   * 
   * @param agent - Agent information
   * @returns Tool instance
   */
  private createSubAgentTool(agent: any): Tool {
    return {
      id: `subagent--${agent.unique_id || agent.id}`,
      description: agent.longDescription || agent.description || `Sub-agent: ${agent.name}`,
      inputSchema: require('zod').object({
        task: require('zod').string().describe('The task to be executed by the sub-agent')
      }),
      outputSchema: require('zod').string(),
      validateInput: (input: unknown) => input,
      validateOutput: (output: unknown) => output,
      execute: async ({ context }) => {
        // Use CodeBolt's agent system to execute the sub-agent
        const { agent: codeboltAgent } = codeboltjs;
        const result = await codeboltAgent.startAgent(agent.unique_id || agent.id, context.task);
        return result;
      }
    };
  }

  /**
   * Process mentioned files and return their contents
   * 
   * @param mentionedFiles - List of file paths
   * @returns Array of file contents with headers
   */
  private async processFiles(mentionedFiles: string[]): Promise<string[]> {
    const processing = this.config.processing || {};
    const fileContents: string[] = [];

    for (const filePath of mentionedFiles) {
      try {
        let content: string;

        if (processing.fileContentProcessor) {
          content = await processing.fileContentProcessor(filePath);
        } else {
          // Default file processing using CodeBolt's filesystem
          const { fs } = codeboltjs;
          const result = await fs.readFile(filePath);
          content = result.data || '';
        }

        fileContents.push(`--- File: ${filePath} ---\n${content}`);
      } catch (error) {
        console.warn(`Failed to read file ${filePath}:`, error);
        fileContents.push(`--- File: ${filePath} ---\n[Error reading file: ${error}]`);
      }
    }

    return fileContents;
  }
}

/**
 * Create a new ComposableAgent instance
 * 
 * @param config - Agent configuration
 * @returns ComposableAgent instance
 */
export function createAgent(config: ComposableAgentConfig): ComposableAgent {
  return new ComposableAgent(config);
}
