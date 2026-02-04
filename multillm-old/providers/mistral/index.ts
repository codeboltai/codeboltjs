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
 * Mistral model token limits
 * Based on LiteLLM model_prices_and_context_window.json (2025)
 */
const MISTRAL_MODEL_TOKEN_LIMITS: Record<string, { tokenLimit: number; maxOutput: number; supportsTools?: boolean; supportsVision?: boolean; supportsReasoning?: boolean }> = {
  // Mistral Large 3 (latest with vision)
  'mistral-large-3': { tokenLimit: 256000, maxOutput: 8191, supportsVision: true, supportsTools: true },
  // Large models
  'mistral-large-latest': { tokenLimit: 128000, maxOutput: 128000, supportsTools: true },
  'mistral-large-2411': { tokenLimit: 128000, maxOutput: 128000, supportsTools: true },
  'mistral-large-2407': { tokenLimit: 128000, maxOutput: 128000, supportsTools: true },
  'mistral-large-2402': { tokenLimit: 32000, maxOutput: 8191, supportsTools: true },
  // Medium models
  'mistral-medium-latest': { tokenLimit: 131072, maxOutput: 8191, supportsTools: true },
  'mistral-medium-2505': { tokenLimit: 131072, maxOutput: 8191, supportsTools: true },
  'mistral-medium-2312': { tokenLimit: 32000, maxOutput: 8191 },
  'mistral-medium': { tokenLimit: 32000, maxOutput: 8191 },
  // Small models
  'mistral-small-latest': { tokenLimit: 32000, maxOutput: 8191, supportsTools: true },
  'mistral-small': { tokenLimit: 32000, maxOutput: 8191, supportsTools: true },
  'mistral-tiny': { tokenLimit: 32000, maxOutput: 8191 },
  // Codestral (code models)
  'codestral-latest': { tokenLimit: 32000, maxOutput: 8191 },
  'codestral-2405': { tokenLimit: 32000, maxOutput: 8191 },
  'codestral-2508': { tokenLimit: 256000, maxOutput: 256000, supportsTools: true },
  'codestral-mamba-latest': { tokenLimit: 256000, maxOutput: 256000 },
  'open-codestral-mamba': { tokenLimit: 256000, maxOutput: 256000 },
  // Devstral (developer models)
  'devstral-2512': { tokenLimit: 256000, maxOutput: 256000, supportsTools: true },
  'devstral-medium-2507': { tokenLimit: 128000, maxOutput: 128000, supportsTools: true },
  'devstral-small-2507': { tokenLimit: 128000, maxOutput: 128000, supportsTools: true },
  'devstral-small-2505': { tokenLimit: 128000, maxOutput: 128000, supportsTools: true },
  'labs-devstral-small-2512': { tokenLimit: 256000, maxOutput: 256000, supportsTools: true },
  // Magistral (reasoning models)
  'magistral-medium-latest': { tokenLimit: 40000, maxOutput: 40000, supportsTools: true, supportsReasoning: true },
  'magistral-medium-2509': { tokenLimit: 40000, maxOutput: 40000, supportsTools: true, supportsReasoning: true },
  'magistral-medium-2506': { tokenLimit: 40000, maxOutput: 40000, supportsTools: true, supportsReasoning: true },
  'magistral-small-latest': { tokenLimit: 40000, maxOutput: 40000, supportsTools: true, supportsReasoning: true },
  'magistral-small-2506': { tokenLimit: 40000, maxOutput: 40000, supportsTools: true, supportsReasoning: true },
  // Pixtral (vision models)
  'pixtral-large-latest': { tokenLimit: 128000, maxOutput: 128000, supportsVision: true, supportsTools: true },
  'pixtral-large-2411': { tokenLimit: 128000, maxOutput: 128000, supportsVision: true, supportsTools: true },
  'pixtral-12b-2409': { tokenLimit: 128000, maxOutput: 128000, supportsVision: true, supportsTools: true },
  // Open models
  'open-mistral-7b': { tokenLimit: 32000, maxOutput: 8191 },
  'open-mistral-nemo': { tokenLimit: 128000, maxOutput: 128000 },
  'open-mistral-nemo-2407': { tokenLimit: 128000, maxOutput: 128000 },
  'open-mixtral-8x7b': { tokenLimit: 32000, maxOutput: 8191, supportsTools: true },
  'open-mixtral-8x22b': { tokenLimit: 65336, maxOutput: 8191, supportsTools: true },
  // Ministral models
  'ministral-3b-latest': { tokenLimit: 128000, maxOutput: 8192 },
  'ministral-8b-latest': { tokenLimit: 128000, maxOutput: 8192, supportsTools: true },
};

interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

interface FunctionCall {
  name: string;
  arguments: string;
}

interface ChatCompletionOptionsWithTools extends ChatCompletionOptions {
  tools?: any[];
  functions?: any[];
  tool_choice?: any;
  function_call?: any;
}

interface ExtendedChatMessage extends ChatMessage {
  function_call?: FunctionCall;
  tool_calls?: ToolCall[];
}

interface MistralMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

interface MistralChoice {
  index: number;
  message: MistralMessage;
  finish_reason: string;
}

interface MistralStreamChoice {
  index: number;
  delta: {
    role?: string;
    content?: string;
  };
  finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null;
}

interface MistralStreamResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: MistralStreamChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

function transformMessages(messages: ExtendedChatMessage[]): MistralMessage[] {
  return messages.map(message => {
    const baseMessage: MistralMessage = {
      role: message.role === 'function' || message.role === 'tool' ? 'tool' : 
            message.role === 'assistant' ? 'assistant' : 
            message.role === 'system' ? 'system' : 'user',
      content: message.content || null
    };

    if (message.function_call || message.tool_calls) {
      baseMessage.tool_calls = (message.function_call ? [{
        id: `call_${Date.now()}`,
        type: 'function',
        function: {
          name: message.function_call.name,
          arguments: message.function_call.arguments
        }
      }] : message.tool_calls);
    }

    if (message.tool_call_id) {
      baseMessage.tool_call_id = message.tool_call_id;
    }

    return baseMessage;
  });
}

class MistralAI implements LLMProvider {
  public model: string | null;
  public device_map: string | null;
  public apiKey: string | null;
  public apiEndpoint: string | null;
  public provider: "mistral";

  constructor(
    model: string | null = null,
    device_map: string | null = null,
    apiKey: string | null = null,
    apiEndpoint: string | null = null
  ) {
    this.model = model || "mistral-large-latest";
    this.device_map = device_map;
    this.apiKey = apiKey;
    this.apiEndpoint = apiEndpoint ?? "https://api.mistral.ai/v1";
    this.provider = "mistral";
  }

  async createCompletion(options: ChatCompletionOptionsWithTools): Promise<ChatCompletionResponse> {
    try {
      const response = await axios.post(
        `${this.apiEndpoint}/chat/completions`,
        {
          model: options.model || this.model || "mistral-large-latest",
          messages: transformMessages(options.messages),
          temperature: options.temperature,
          max_tokens: options.max_tokens,
          top_p: options.top_p,
          stream: options.stream,
          stop: options.stop,
          tools: options.tools || options.functions,
          tool_choice: options.tool_choice || options.function_call
        },
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
            model: options.model || this.model || "mistral-large-latest",
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
                  const data = JSON.parse(line.slice(6));
                  if (data.choices && Array.isArray(data.choices)) {
                    streamResponse.choices = data.choices.map((choice: any) => ({
                      index: choice.index,
                      delta: choice.delta,
                      finish_reason: choice.finish_reason
                    }));
                  }
                  if (data.usage) {
                    streamResponse.usage = data.usage;
                  }
                }
              }
            } catch (error) {
              reject(handleError(error));
            }
          });

          stream.on('end', () => {
            resolve(streamResponse);
          });

          stream.on('error', (error: unknown) => {
            reject(handleError(error));
          });
        });
      }

      const modelId = options.model || this.model || "mistral-large-latest";
      const limits = MISTRAL_MODEL_TOKEN_LIMITS[modelId];

      // Transform Mistral response to standard format
      return {
        id: response.data.id,
        object: 'chat.completion',
        created: response.data.created,
        model: response.data.model,
        choices: response.data.choices.map((choice: MistralChoice) => ({
          index: choice.index,
          message: {
            role: choice.message.role,
            content: choice.message.content,
            tool_calls: choice.message.tool_calls,
            tool_call_id: choice.message.tool_call_id
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
        const limits = MISTRAL_MODEL_TOKEN_LIMITS[model.id];
        return {
          id: model.id,
          name: model.id,
          provider: "Mistral",
          type: 'chat' as const,
          tokenLimit: limits?.tokenLimit,
          maxOutputTokens: limits?.maxOutput,
          supportsTools: limits?.supportsTools,
          supportsVision: limits?.supportsVision,
          supportsReasoning: limits?.supportsReasoning
        };
      });
    } catch (error) {
      throw handleError(error);
    }
  }
}

export default MistralAI; 