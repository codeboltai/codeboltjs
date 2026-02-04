import axios from 'axios';
import type { BaseProvider, ChatCompletionOptions, ChatCompletionResponse, LLMProvider, ModelInfo } from '../../types';
import parseToolToSystemPrompt, { parseAssistantMessage } from './../../utils/toolParser'

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: any;
}

interface ToolFunction {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: {
      command: {
        type: string;
        description: string;
      }
    };
    required: string[];
  };
}

interface Tool {
  type: string;
  function: ToolFunction;
}
interface CompletionOptions {
  model: string;
  messages: Message[];
  tools: Tool[],
  supportTools?:boolean
}

interface CompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: Message;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface Model {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  provider?: string;
}

class LMStudio implements LLMProvider {
  private embeddingModels: string[];
  public model: string | null;
  public device_map: string | null;
  public apiKey: null = null;
  public apiEndpoint: string;
  public provider: "lmstudio" = "lmstudio" as any;

  constructor(
    model: string | null = null,
    device_map: string | null = null,
    apiEndpoint: string | null = null
  ) {
    this.model = model;
    this.device_map = device_map;
    this.embeddingModels = [];
    this.apiEndpoint = apiEndpoint ?? "http://localhost:1234/v1";
  }

  async createCompletion(options: any): Promise<ChatCompletionResponse > {
    try {
      const response = await axios.post(
        `${this.apiEndpoint}/chat/completions`,
        {
          model: options.model,
          messages: !options.supportTools ? parseToolToSystemPrompt(options["messages"], options.tools) : options.messages
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (options.supportTools) {
        // LMStudio models don't have predefined token limits - they are determined at runtime
        return response.data;
      }

      response.data.choices = parseAssistantMessage(response.data.choices[0].message.content, options.tools);
      // LMStudio models don't have predefined token limits - they are determined at runtime
      return response.data;
    } catch (error) {
      console.error("Error generating completion:", error);
      throw error
    }
  }

  async getModels(): Promise<ModelInfo[]> {
    try {
      const response = await axios.get<{ data: Model[] }>(
        `${this.apiEndpoint}/models`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const allModels: ModelInfo[] = response.data.data.map((model) => ({
        id: model.id,
        name: model.id,
        provider: "LM Studio",
        type: 'chat' as const
      }));
      return allModels;
    } catch (error) {
      console.error("Error fetching models:", error);
      return [];
    }
  }
}

export default LMStudio; 