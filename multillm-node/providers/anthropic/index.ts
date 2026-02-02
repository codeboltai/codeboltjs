import Anthropic from '@anthropic-ai/sdk';
import { handleError } from '../../utils/errorHandler';
import { modelCache } from '../../utils/cacheManager';
import { isMultimodalContent, transformContentForAnthropic, extractTextContent } from '../../utils/contentTransformer';
import { isReasoningModel, getAnthropicThinkingParams } from '../../utils/reasoningModels';
import type {
  BaseProvider,
  ChatCompletionOptions,
  ChatCompletionResponse,
  ChatMessage,
  Tool,
  ToolCall,
  AnthropicMessage,
  AnthropicContent,
  AnthropicTool,
  AnthropicResponse,
  StreamChunk,
  StreamingOptions,
  ProviderCapabilities,
  LLMProviderWithStreaming,
  CacheControl,
  EmbeddingOptions,
  EmbeddingResponse
} from '../../types';

class AnthropicProvider implements LLMProviderWithStreaming {
  private options: BaseProvider;
  private embeddingModels: string[];
  private chatModels: string[];
  private client: Anthropic;
  public model: string | null;
  public device_map: string | null;
  public apiKey: string | null;
  public apiEndpoint: string | null;
  public provider: "anthropic";

  constructor(
    model: string | null = null,
    device_map: string | null = null,
    apiKey: string | null = null,
    apiEndpoint: string | null = null
  ) {
    this.embeddingModels = []; // Anthropic doesn't provide embedding models
    this.chatModels = [
      "claude-3-opus-20240229",
      "claude-3-sonnet-20240229",
      "claude-3-haiku-20240307",
      "claude-3-5-sonnet-20241022",
      "claude-3-5-haiku-20241022",
      "claude-3-5-sonnet-20250114", // Latest Claude 3.5 Sonnet
      "claude-3-5-haiku-20250107", // Latest Claude 3.5 Haiku
      "claude-sonnet-4-20250514", // Claude Sonnet 4
      "claude-opus-4-20250514", // Claude Opus 4
      "claude-3-7-sonnet-20250219" // Claude 3.7 Sonnet
    ];
    this.model = model;
    this.device_map = device_map;
    this.apiKey = apiKey;
    this.apiEndpoint = apiEndpoint ?? "https://api.anthropic.com/v1";
    this.provider = "anthropic";
    
    // Initialize Anthropic client
    this.client = new Anthropic({
      apiKey: this.apiKey || undefined,
      baseURL: this.apiEndpoint
    });
    
    this.options = { model, device_map, apiKey, apiEndpoint: this.apiEndpoint };
  }

  /**
   * Transform OpenAI messages to Anthropic format
   * @param messages - Array of chat messages
   * @param options - Optional caching configuration
   */
  private async transformMessagesToAnthropic(
    messages: ChatMessage[],
    options?: { enableCaching?: boolean; cacheControl?: CacheControl; systemCacheControl?: CacheControl }
  ): Promise<{ messages: AnthropicMessage[], system?: string | Array<{ type: 'text'; text: string; cache_control?: CacheControl }> }> {
    const anthropicMessages: AnthropicMessage[] = [];
    const systemMessages: string[] = [];

    for (const message of messages) {
      if (message.role === 'system') {
        // Anthropic handles system messages separately - collect all system messages
        const textContent = extractTextContent(message.content);
        if (textContent) {
          systemMessages.push(textContent);
        }
        continue;
      }

      if (message.role === 'function' || message.role === 'tool') {
        // Convert function/tool messages to tool_result content
        // Use tool_call_id if available, otherwise use name or message name
        const toolUseId = message.tool_call_id || message.name || 'unknown';

        anthropicMessages.push({
          role: 'user',
          content: [{
            type: 'tool_result',
            tool_use_id: toolUseId,
            content: extractTextContent(message.content),
            is_error: false // You can modify this based on your error handling logic
          }]
        });
        continue;
      }

      if (message.role === 'assistant') {
        const content: AnthropicContent[] = [];

        // Add text content if present
        const textContent = extractTextContent(message.content);
        if (textContent && textContent.trim()) {
          content.push({
            type: 'text',
            text: textContent
          });
        }

        // Add tool calls if present
        if (message.tool_calls && message.tool_calls.length > 0) {
          for (const toolCall of message.tool_calls) {
            let parsedInput: any = {};
            try {
              // Handle both string and already parsed arguments
              if (typeof toolCall.function.arguments === 'string') {
                parsedInput = JSON.parse(toolCall.function.arguments || '{}');
              } else {
                parsedInput = toolCall.function.arguments || {};
              }
            } catch (error) {
              console.warn(`Failed to parse tool call arguments for ${toolCall.function.name}:`, toolCall.function.arguments);
              parsedInput = {};
            }

            content.push({
              type: 'tool_use',
              id: toolCall.id,
              name: toolCall.function.name,
              input: parsedInput
            });
          }
        }

        // Only add assistant message if there's content
        if (content.length > 0) {
          anthropicMessages.push({
            role: 'assistant',
            content: content.length === 1 && content[0].type === 'text'
              ? content[0].text!
              : content
          });
        }
        continue;
      }

      if (message.role === 'user') {
        // Handle multimodal content for user messages
        if (isMultimodalContent(message.content)) {
          const transformedContent = await transformContentForAnthropic(message.content);
          anthropicMessages.push({
            role: 'user',
            content: transformedContent as any
          });
        } else {
          anthropicMessages.push({
            role: 'user',
            content: extractTextContent(message.content)
          });
        }
        continue;
      }
    }

    // Ensure messages alternate between user and assistant
    // Anthropic requires strict alternation
    const alternatingMessages: AnthropicMessage[] = [];
    let lastRole: 'user' | 'assistant' | null = null;

    for (const message of anthropicMessages) {
      if (message.role !== lastRole) {
        alternatingMessages.push(message);
        lastRole = message.role;
      } else {
        // If we have consecutive messages from the same role, merge them
        const lastMessage = alternatingMessages[alternatingMessages.length - 1];
        if (lastMessage) {
          // Merge content
          if (typeof lastMessage.content === 'string' && typeof message.content === 'string') {
            lastMessage.content = lastMessage.content + '\n\n' + message.content;
          } else {
            // Convert to array format and merge
            const lastContent = typeof lastMessage.content === 'string' 
              ? [{ type: 'text' as const, text: lastMessage.content }] 
              : lastMessage.content;
            const currentContent = typeof message.content === 'string' 
              ? [{ type: 'text' as const, text: message.content }] 
              : message.content;
            
            lastMessage.content = [...lastContent, ...currentContent];
          }
        }
      }
    }

    // Combine all system messages into one
    // If caching is enabled, return system as array with cache_control
    if (systemMessages.length > 0) {
      const systemText = systemMessages.join('\n\n');

      if (options?.enableCaching && options?.systemCacheControl) {
        // Return system as array format with cache_control for Anthropic's caching
        return {
          messages: alternatingMessages,
          system: [{
            type: 'text' as const,
            text: systemText,
            cache_control: options.systemCacheControl
          }]
        };
      }

      return { messages: alternatingMessages, system: systemText };
    }

    // Add cache_control to the last user message if caching is enabled
    if (options?.enableCaching && options?.cacheControl && alternatingMessages.length > 0) {
      // Find the last user message and add cache_control
      for (let i = alternatingMessages.length - 1; i >= 0; i--) {
        if (alternatingMessages[i].role === 'user') {
          const msg = alternatingMessages[i];
          if (typeof msg.content === 'string') {
            alternatingMessages[i] = {
              ...msg,
              content: [{
                type: 'text',
                text: msg.content,
                cache_control: options.cacheControl
              }]
            };
          }
          break;
        }
      }
    }

    return { messages: alternatingMessages, system: undefined };
  }

  /**
   * Transform OpenAI tools to Anthropic format
   * @param tools - Array of tools
   * @param cacheControl - Optional cache control for tools (applied to last tool for Anthropic caching)
   */
  private transformToolsToAnthropic(tools?: Tool[], cacheControl?: CacheControl): AnthropicTool[] | undefined {
    if (!tools || tools.length === 0) return undefined;

    return tools.map((tool, index) => {
      const anthropicTool: AnthropicTool = {
        name: tool.function.name,
        description: tool.function.description,
        input_schema: tool.function.parameters || {}
      };

      // Add cache_control to the last tool (Anthropic's requirement for tool caching)
      if (cacheControl && index === tools.length - 1) {
        (anthropicTool as any).cache_control = cacheControl;
      }

      return anthropicTool;
    });
  }

  /**
   * Transform Anthropic response to OpenAI format
   * @param anthropicResponse - The Anthropic API response
   * @param includeCacheInfo - Whether to include cache usage information
   * @param includeThinking - Whether to include extended thinking content
   */
  private transformResponseToOpenAI(
    anthropicResponse: AnthropicResponse,
    includeCacheInfo?: boolean,
    includeThinking?: boolean
  ): ChatCompletionResponse {
    const message: ChatMessage = {
      role: 'assistant',
      content: ''
    };

    const toolCalls: ToolCall[] = [];
    let textContent = '';
    let thinkingContent = '';
    let thinkingSignature: string | undefined;

    // Process all content blocks from Anthropic response
    for (const content of anthropicResponse.content) {
      const contentBlock = content as any; // Cast to any to handle extended thinking blocks
      if (contentBlock.type === 'text') {
        textContent += contentBlock.text || '';
      } else if (contentBlock.type === 'thinking') {
        // Extended thinking content block
        thinkingContent += contentBlock.thinking || '';
        if (contentBlock.signature) {
          thinkingSignature = contentBlock.signature;
        }
      } else if (contentBlock.type === 'tool_use') {
        toolCalls.push({
          id: contentBlock.id || `tool_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          type: 'function',
          function: {
            name: contentBlock.name || '',
            arguments: JSON.stringify(contentBlock.input || {})
          }
        });
      }
    }

    // Set message content - if there's text content, use it; otherwise null for tool-only responses
    message.content = textContent || null;

    // Add tool calls if present
    if (toolCalls.length > 0) {
      message.tool_calls = toolCalls;
    }

    // Add reasoning content if thinking was enabled and we have thinking content
    let reasoning: { thinking: string; signature?: string } | undefined;
    if (includeThinking && thinkingContent) {
      reasoning = {
        thinking: thinkingContent,
        signature: thinkingSignature
      };
    }

    const choice = {
      index: 0,
      message: reasoning ? { ...message, reasoning } : message,
      finish_reason: this.mapStopReason(anthropicResponse.stop_reason)
    };

    // Build usage object with cache information if available
    const rawUsage = anthropicResponse.usage as any;
    const usage: ChatCompletionResponse['usage'] = {
      prompt_tokens: rawUsage.input_tokens,
      completion_tokens: rawUsage.output_tokens,
      total_tokens: rawUsage.input_tokens + rawUsage.output_tokens
    };

    // Add cache usage information if caching was enabled
    if (includeCacheInfo) {
      // Anthropic returns cache_read_input_tokens and cache_creation_input_tokens
      if (rawUsage.cache_read_input_tokens !== undefined) {
        usage.cached_tokens = rawUsage.cache_read_input_tokens;
      }
      if (rawUsage.cache_creation_input_tokens !== undefined) {
        usage.cache_creation_tokens = rawUsage.cache_creation_input_tokens;
      }
      // Store raw provider usage for debugging/advanced use
      usage.provider_usage = {
        input_tokens: rawUsage.input_tokens,
        output_tokens: rawUsage.output_tokens,
        cache_read_input_tokens: rawUsage.cache_read_input_tokens,
        cache_creation_input_tokens: rawUsage.cache_creation_input_tokens
      };
    }

    // Add reasoning tokens if extended thinking was used
    if (includeThinking && rawUsage.thinking_tokens !== undefined) {
      usage.reasoning_tokens = rawUsage.thinking_tokens;
    }

    return {
      id: anthropicResponse.id,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: anthropicResponse.model,
      choices: [choice],
      usage
    };
  }

  /**
   * Map Anthropic stop reasons to OpenAI finish reasons
   */
  private mapStopReason(stopReason: string): 'stop' | 'length' | 'tool_calls' | 'content_filter' | null {
    switch (stopReason) {
      case 'end_turn':
        return 'stop';
      case 'max_tokens':
        return 'length';
      case 'tool_use':
        return 'tool_calls';
      case 'stop_sequence':
        return 'stop';
      default:
        return 'stop';
    }
  }

  /**
   * Map OpenAI tool choice to Anthropic format
   */
  private mapToolChoice(toolChoice?: ChatCompletionOptions['tool_choice']) {
    if (!toolChoice || toolChoice === 'auto') {
      return { type: 'auto' as const };
    }
    if (toolChoice === 'none') {
      return undefined; // Anthropic doesn't have explicit 'none', just omit tool_choice
    }
    if (typeof toolChoice === 'object' && toolChoice.type === 'function') {
      return {
        type: 'tool' as const,
        name: toolChoice.function.name
      };
    }
    // Handle 'required' or any other string values as 'any'
    if (typeof toolChoice === 'string') {
      return { type: 'any' as const };
    }
    return { type: 'auto' as const };
  }

  async createCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    try {
      // Validate API key
      if (!this.apiKey) {
        throw new Error("Anthropic API key is required. Please set your API key.");
      }

      // Check if caching is enabled
      const enableCaching = options.enableCaching;
      const cachingOptions = enableCaching ? {
        enableCaching: true,
        cacheControl: options.cacheControl,
        systemCacheControl: options.systemCacheControl
      } : undefined;

      const { messages, system } = await this.transformMessagesToAnthropic(options.messages, cachingOptions);
      const tools = this.transformToolsToAnthropic(options.tools, enableCaching ? options.toolsCacheControl : undefined);
      
      // Validate that we have messages
      if (!messages || messages.length === 0) {
        throw new Error("At least one message is required");
      }

      // Ensure first message is from user (Anthropic requirement)
      if (messages[0].role !== 'user') {
        throw new Error("First message must be from user");
      }
      
      const modelName = options.model || this.model || "claude-3-5-sonnet-20241022";
      const isThinkingModel = isReasoningModel(modelName, 'anthropic');
      const enableThinking = isThinkingModel && options.reasoning?.includeReasoning !== false;

      // Create the request object directly to support array system format for caching
      const requestPayload: any = {
        model: modelName,
        max_tokens: options.max_tokens || 4096,
        messages,
        stream: options.stream || false
      };

      // System can be string or array (for caching with cache_control)
      if (system) {
        requestPayload.system = system;
      }

      if (options.temperature !== undefined) {
        requestPayload.temperature = options.temperature;
      }

      if (options.top_p !== undefined) {
        requestPayload.top_p = options.top_p;
      }

      if (tools && tools.length > 0) {
        requestPayload.tools = tools;
        const toolChoice = this.mapToolChoice(options.tool_choice);
        if (toolChoice) {
          requestPayload.tool_choice = toolChoice;
        }
      }

      if (options.stop) {
        requestPayload.stop_sequences = Array.isArray(options.stop) ? options.stop : [options.stop];
      }

      // Add extended thinking for supported models
      if (enableThinking) {
        const thinkingParams = getAnthropicThinkingParams({
          includeReasoning: options.reasoning?.includeReasoning,
          thinkingBudget: options.reasoning?.thinkingBudget
        });
        if (thinkingParams) {
          requestPayload.thinking = thinkingParams;
        }
      }

      // Add beta header for prompt caching if enabled
      let response;
      if (enableCaching) {
        response = await this.client.beta.promptCaching.messages.create(requestPayload);
      } else {
        response = await this.client.messages.create(requestPayload);
      }

      return this.transformResponseToOpenAI(response as any, enableCaching, enableThinking);
    } catch (error) {
      // Enhanced error handling with context
      const handledError = handleError(error);
      
      // Add provider context to the error
      if (handledError.error) {
        handledError.error.provider = 'anthropic';
        handledError.error.model = options.model || this.model || "claude-3-5-sonnet-20241022";
        
        // Add specific guidance for common Anthropic errors
        if (handledError.error.message?.includes('credit balance is too low')) {
          handledError.error.suggestion = 'Please check your Anthropic account billing and add credits to continue using the API.';
        } else if (handledError.error.message?.includes('rate limit')) {
          handledError.error.suggestion = 'Rate limit exceeded. Please wait before making another request.';
        } else if (handledError.error.message?.includes('invalid_request_error')) {
          handledError.error.suggestion = 'Please check your request parameters and ensure they meet Anthropic API requirements.';
        }
      }
      
      throw handledError;
    }
  }

  /**
   * Create completion with streaming support and callbacks
   */
  async createCompletionStream(options: StreamingOptions): Promise<ChatCompletionResponse> {
    const modelName = options.model || this.model || "claude-3-5-sonnet-20241022";

    try {
      // Validate API key
      if (!this.apiKey) {
        throw new Error("Anthropic API key is required. Please set your API key.");
      }

      const { messages, system } = await this.transformMessagesToAnthropic(options.messages);
      const tools = this.transformToolsToAnthropic(options.tools);

      // Build request payload
      const requestPayload: any = {
        model: modelName,
        max_tokens: options.max_tokens || 4096,
        messages,
        stream: true
      };

      if (system) requestPayload.system = system;
      if (options.temperature !== undefined) requestPayload.temperature = options.temperature;
      if (options.top_p !== undefined) requestPayload.top_p = options.top_p;
      if (tools && tools.length > 0) {
        requestPayload.tools = tools;
        const toolChoice = this.mapToolChoice(options.tool_choice);
        if (toolChoice) requestPayload.tool_choice = toolChoice;
      }
      if (options.stop) {
        requestPayload.stop_sequences = Array.isArray(options.stop) ? options.stop : [options.stop];
      }

      const stream = await this.client.messages.create(requestPayload);

      // Accumulate response data
      let textContent = '';
      const toolCalls: ToolCall[] = [];
      let currentToolCall: { id: string; name: string; arguments: string } | null = null;
      let usage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
      let finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null = 'stop';
      let responseId = `msg_${Date.now()}`;

      for await (const event of stream as any) {
        // Check for abort signal
        if (options.signal?.aborted) break;

        // Handle different Anthropic event types
        if (event.type === 'message_start') {
          responseId = event.message?.id || responseId;
          if (event.message?.usage) {
            usage.prompt_tokens = event.message.usage.input_tokens || 0;
          }
        } else if (event.type === 'content_block_start') {
          if (event.content_block?.type === 'tool_use') {
            currentToolCall = {
              id: event.content_block.id || `tool_${Date.now()}`,
              name: event.content_block.name || '',
              arguments: ''
            };
          }
        } else if (event.type === 'content_block_delta') {
          if (event.delta?.type === 'text_delta') {
            const text = event.delta.text || '';
            textContent += text;

            // Emit chunk
            const chunk: StreamChunk = {
              id: responseId,
              object: 'chat.completion.chunk',
              created: Math.floor(Date.now() / 1000),
              model: modelName,
              choices: [{
                index: 0,
                delta: { content: text },
                finish_reason: null
              }]
            };
            options.onChunk?.(chunk);
          } else if (event.delta?.type === 'input_json_delta' && currentToolCall) {
            currentToolCall.arguments += event.delta.partial_json || '';
          }
        } else if (event.type === 'content_block_stop') {
          if (currentToolCall) {
            toolCalls.push({
              id: currentToolCall.id,
              type: 'function',
              function: {
                name: currentToolCall.name,
                arguments: currentToolCall.arguments
              }
            });
            currentToolCall = null;
          }
        } else if (event.type === 'message_delta') {
          if (event.delta?.stop_reason) {
            finishReason = this.mapStopReason(event.delta.stop_reason);
          }
          if (event.usage?.output_tokens) {
            usage.completion_tokens = event.usage.output_tokens;
            usage.total_tokens = usage.prompt_tokens + usage.completion_tokens;
          }
        }
      }

      // Build final response
      const response: ChatCompletionResponse = {
        id: responseId,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: modelName,
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: textContent || null,
            tool_calls: toolCalls.length > 0 ? toolCalls : undefined
          },
          finish_reason: finishReason
        }],
        usage
      };

      options.onComplete?.(response);
      return response;
    } catch (error) {
      options.onError?.(error as Error);
      throw handleError(error);
    }
  }

  /**
   * AsyncGenerator-based streaming
   */
  async *streamCompletion(options: ChatCompletionOptions): AsyncGenerator<StreamChunk, void, unknown> {
    const modelName = options.model || this.model || "claude-3-5-sonnet-20241022";

    try {
      // Validate API key
      if (!this.apiKey) {
        throw new Error("Anthropic API key is required. Please set your API key.");
      }

      const { messages, system } = await this.transformMessagesToAnthropic(options.messages);
      const tools = this.transformToolsToAnthropic(options.tools);

      // Build request payload
      const requestPayload: any = {
        model: modelName,
        max_tokens: options.max_tokens || 4096,
        messages,
        stream: true
      };

      if (system) requestPayload.system = system;
      if (options.temperature !== undefined) requestPayload.temperature = options.temperature;
      if (options.top_p !== undefined) requestPayload.top_p = options.top_p;
      if (tools && tools.length > 0) {
        requestPayload.tools = tools;
        const toolChoice = this.mapToolChoice(options.tool_choice);
        if (toolChoice) requestPayload.tool_choice = toolChoice;
      }
      if (options.stop) {
        requestPayload.stop_sequences = Array.isArray(options.stop) ? options.stop : [options.stop];
      }

      const stream = await this.client.messages.create(requestPayload);
      let responseId = `msg_${Date.now()}`;

      for await (const event of stream as any) {
        if (event.type === 'message_start') {
          responseId = event.message?.id || responseId;
        } else if (event.type === 'content_block_delta') {
          if (event.delta?.type === 'text_delta') {
            yield {
              id: responseId,
              object: 'chat.completion.chunk',
              created: Math.floor(Date.now() / 1000),
              model: modelName,
              choices: [{
                index: 0,
                delta: { content: event.delta.text || '' },
                finish_reason: null
              }]
            };
          }
        } else if (event.type === 'message_delta') {
          if (event.delta?.stop_reason) {
            yield {
              id: responseId,
              object: 'chat.completion.chunk',
              created: Math.floor(Date.now() / 1000),
              model: modelName,
              choices: [{
                index: 0,
                delta: {},
                finish_reason: this.mapStopReason(event.delta.stop_reason)
              }]
            };
          }
        }
      }
    } catch (error) {
      throw handleError(error);
    }
  }

  /**
   * Get provider capabilities
   */
  getCapabilities(): ProviderCapabilities {
    return {
      supportsStreaming: true,
      supportsTools: true,
      supportsVision: true,
      supportsEmbeddings: false,
      supportsCaching: true,
      cachingType: 'explicit', // Anthropic requires explicit cache_control markers
      supportsReasoning: true, // Claude 3.7+, Sonnet 4, Opus 4 support extended thinking
      supportsMultimodal: true // Vision models support images and PDFs
    };
  }

  async getModels(): Promise<any> {
    // Check cache first
    const cacheKey = 'models:anthropic';
    const cached = modelCache.get<any[]>(cacheKey);
    if (cached) return cached;

    // Anthropic doesn't have a models endpoint, so return static list
    const models = this.chatModels.map(model => ({
      id: model,
      name: model,
      provider: "Anthropic",
      type: "chat"
    }));

    modelCache.set(cacheKey, models);
    return models;
  }

  async createEmbedding(options: EmbeddingOptions): Promise<EmbeddingResponse> {
    throw new Error("Anthropic does not support embeddings. Use OpenAI or another provider for embeddings.");
  }
}

export default AnthropicProvider;