import axios from 'axios';
import { handleError } from '../../utils/errorHandler';
import type {
  BaseProvider,
  LLMProvider,
  ChatCompletionOptions,
  ChatCompletionResponse,
  Provider,
  ChatMessage,
  ModelInfo
} from '../../types';

/**
 * DeepSeek model token limits
 * Based on LiteLLM model_prices_and_context_window.json (2025)
 */
const DEEPSEEK_MODEL_TOKEN_LIMITS: Record<string, { tokenLimit: number; maxOutput: number; supportsTools?: boolean; supportsReasoning?: boolean }> = {
  // DeepSeek V3 series
  'deepseek-v3.2': { tokenLimit: 163840, maxOutput: 163840, supportsTools: true, supportsReasoning: true },
  'deepseek-v3': { tokenLimit: 65536, maxOutput: 8192, supportsTools: true },
  // DeepSeek R1 (reasoning)
  'deepseek-r1': { tokenLimit: 65536, maxOutput: 8192, supportsTools: true, supportsReasoning: true },
  // DeepSeek Chat and Coder
  'deepseek-chat': { tokenLimit: 128000, maxOutput: 8192, supportsTools: true },
  'deepseek-coder': { tokenLimit: 128000, maxOutput: 4096, supportsTools: true },
  // DeepSeek Reasoner
  'deepseek-reasoner': { tokenLimit: 128000, maxOutput: 8192, supportsTools: true, supportsReasoning: true },
};

interface DeepseekMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  tool_calls?: Array<{
    type: string;
    function: {
      name: string;
      arguments: string;
    };
  }>;
}

interface DeepseekChoice {
  index: number;
  message: DeepseekMessage;
  finish_reason: string;
}

function transformMessages(messages: ChatMessage[]): DeepseekMessage[] {
  return messages.map(message => ({
    role: message.role === 'assistant' ? 'assistant' : 
          message.role === 'system' ? 'system' : 'user',
    content: message.content || '',
    tool_calls: message.tool_calls
  }));
}

class DeepseekAI implements LLMProvider {
  public model: string | null;
  public device_map: string | null;
  public apiKey: string | null;
  public apiEndpoint: string | null;
  public provider: "deepseek";

  constructor(
    model: string | null = null,
    device_map: string | null = null,
    apiKey: string | null = null,
    apiEndpoint: string | null = null
  ) {
    this.model = model || "deepseek-chat";
    this.device_map = device_map;
    this.apiKey = apiKey;
    this.apiEndpoint = apiEndpoint;
    this.provider = "deepseek";
  }

  async createCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    try {
      const requestBody: {
        model: string;
        messages: DeepseekMessage[];
        temperature?: number;
        max_tokens?: number;
        top_p?: number;
        stream?: boolean;
        stop?: string | string[];
        tools?: any[];
      } = {
        model: options.model || this.model || "deepseek-chat",
        messages: transformMessages(options.messages),
        temperature: options.temperature,
        max_tokens: options.max_tokens,
        top_p: options.top_p,
        stream: options.stream,
        stop: options.stop
      };

      if (options.tools) {
        requestBody.tools = options.tools;
      }

      const response = await axios.post(
        `${this.apiEndpoint}/chat/completions`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${this.apiKey}`,
          },
          responseType: options.stream ? 'stream' : 'json'
        }
      );

      if (options.stream) {
        const stream = response.data;
        return new Promise((resolve, reject) => {
          const streamResponse: ChatCompletionResponse = {
            id: '',
            object: 'chat.completion.chunk',
            created: Math.floor(Date.now() / 1000),
            model: options.model || this.model || "deepseek-chat",
            choices: [],
            usage: {
              prompt_tokens: 0,
              completion_tokens: 0,
              total_tokens: 0
            }
          };

          stream.on('data', (chunk: Buffer) => {
            try {
              const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  if (data === '[DONE]') {
                    streamResponse.choices.push({
                      index: 0,
                      message: {
                        role: 'assistant',
                        content: ''
                      },
                      delta: {},
                      finish_reason: 'stop'
                    });
                    resolve(streamResponse);
                  } else {
                    try {
                      // Only try to parse if the data looks like a complete JSON object
                      if (data.startsWith('{') && data.endsWith('}')) {
                        const parsedData = JSON.parse(data);
                        if (parsedData.choices && Array.isArray(parsedData.choices)) {
                          const choice = parsedData.choices[0];
                          if (choice.delta && choice.delta.content) {
                            streamResponse.choices.push({
                              index: 0,
                              message: {
                                role: 'assistant',
                                content: choice.delta.content
                              },
                              delta: choice.delta,
                              finish_reason: choice.finish_reason
                            });
                          }
                        }
                        if (parsedData.usage) {
                          streamResponse.usage = parsedData.usage;
                        }
                      }
                    } catch (parseError) {
                      // Silently ignore parsing errors for incomplete JSON
                      continue;
                    }
                  }
                }
              }
            } catch (error) {
              reject(handleError(error));
            }
          });

          stream.on('end', () => {
            if (streamResponse.choices.length === 0) {
              resolve(streamResponse);
            }
          });

          stream.on('error', (error: unknown) => {
            reject(handleError(error));
          });
        });
      }

      const modelId = options.model || this.model || "deepseek-chat";
      const limits = DEEPSEEK_MODEL_TOKEN_LIMITS[modelId];

      // Transform Deepseek response to standard format
      return {
        id: response.data.id,
        object: 'chat.completion',
        created: response.data.created,
        model: response.data.model,
        choices: response.data.choices.map((choice: DeepseekChoice) => ({
          index: choice.index,
          message: {
            role: choice.message.role,
            content: choice.message.content,
            tool_calls: choice.message.tool_calls
          },
          finish_reason: choice.finish_reason
        })),
        usage: response.data.usage,
        tokenLimit: limits?.tokenLimit,
        maxOutputTokens: limits?.maxOutput
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  async getModels(): Promise<ModelInfo[]> {
    try {
      const response = await axios.get(
        `${this.apiEndpoint}/models`,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.apiKey}`,
          },
        }
      );

      return response.data.data.map((model: { id: string }) => {
        const limits = DEEPSEEK_MODEL_TOKEN_LIMITS[model.id];
        return {
          id: model.id,
          name: model.id,
          provider: "DeepSeek",
          type: 'chat' as const,
          tokenLimit: limits?.tokenLimit,
          maxOutputTokens: limits?.maxOutput,
          supportsTools: limits?.supportsTools,
          supportsReasoning: limits?.supportsReasoning
        };
      });
    } catch (error) {
      throw handleError(error);
    }
  }
}

export default DeepseekAI; 