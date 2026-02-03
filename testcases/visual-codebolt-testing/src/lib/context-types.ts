// Context types for Agent Context Composer

export type BlockRole = "system" | "user" | "assistant" | "tool_call" | "tool_response";
export type BlockSource = "human" | "tool" | "llm";

export interface ContextBlock {
  id: string;
  role: BlockRole;
  content: string | object;
  source: BlockSource;
  included: boolean;           // Toggle to include/exclude from LLM call
  tokenCount: number;
  metadata?: {
    toolName?: string;
    moduleName?: string;
    functionName?: string;
    parameters?: Record<string, unknown>;
    executionId?: string;
    timestamp: Date;
    duration?: number;
  };
}

export interface InferenceCall {
  id: string;
  timestamp: Date;
  model: string;
  inputTokens: number;
  outputTokens: number;
  contextSnapshot: ContextBlock[];  // Exact blocks sent to LLM
  response: {
    type: "text" | "tool_calls";
    content: string | LLMToolCall[];
  };
  status: "pending" | "success" | "error";
  error?: string;
}

export interface LLMToolCall {
  id: string;
  toolName: string;
  arguments: Record<string, unknown>;
  executed?: boolean;
  result?: unknown;
}

// Color scheme for roles
export const ROLE_COLORS: Record<BlockRole, string> = {
  system: "#8b949e",        // Gray
  user: "#3b82f6",          // Blue
  assistant: "#a855f7",     // Purple
  tool_call: "#00d4ff",     // Cyan
  tool_response: "#f59e0b", // Orange
};

// Role labels for display
export const ROLE_LABELS: Record<BlockRole, string> = {
  system: "System",
  user: "User",
  assistant: "Assistant",
  tool_call: "Tool Call",
  tool_response: "Tool Response",
};

// Role icons (using simple characters for now)
export const ROLE_ICONS: Record<BlockRole, string> = {
  system: "⚙",
  user: "👤",
  assistant: "🤖",
  tool_call: "🔧",
  tool_response: "📤",
};

// Helper function to create a new context block
export function createContextBlock(
  role: BlockRole,
  content: string | object,
  source: BlockSource,
  metadata?: ContextBlock['metadata']
): ContextBlock {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    source,
    included: true,
    tokenCount: estimateTokenCount(content),
    metadata: metadata || {
      timestamp: new Date(),
    },
  };
}

// Simple token estimation (roughly 4 chars per token)
export function estimateTokenCount(content: string | object): number {
  const text = typeof content === 'string' ? content : JSON.stringify(content);
  return Math.ceil(text.length / 4);
}

// Calculate block height based on tokens
export function calculateBlockHeight(tokenCount: number): number {
  const MIN_HEIGHT = 48;  // px
  const MAX_HEIGHT = 200; // px
  const MAX_TOKENS = 2000;

  const ratio = Math.min(tokenCount / MAX_TOKENS, 1);
  return MIN_HEIGHT + ratio * (MAX_HEIGHT - MIN_HEIGHT);
}

// Convert context blocks to LLM message format
export function blocksToMessages(blocks: ContextBlock[]): Array<{
  role: string;
  content: string;
  tool_call_id?: string;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: { name: string; arguments: string };
  }>;
}> {
  return blocks
    .filter(block => block.included)
    .map(block => {
      const contentStr = typeof block.content === 'string'
        ? block.content
        : JSON.stringify(block.content);

      if (block.role === 'tool_call') {
        // Tool calls are assistant messages with tool_calls array
        const toolContent = typeof block.content === 'object' ? block.content as LLMToolCall : null;
        return {
          role: 'assistant',
          content: '',
          tool_calls: toolContent ? [{
            id: toolContent.id,
            type: 'function' as const,
            function: {
              name: toolContent.toolName,
              arguments: JSON.stringify(toolContent.arguments),
            },
          }] : [],
        };
      }

      if (block.role === 'tool_response') {
        return {
          role: 'tool',
          content: contentStr,
          tool_call_id: block.metadata?.executionId || '',
        };
      }

      return {
        role: block.role,
        content: contentStr,
      };
    });
}

// Available LLM models - "default" uses codebolt's configured default
export const AVAILABLE_MODELS = [
  { id: 'default', name: 'Default (Codebolt)', provider: 'codebolt' },
] as const;

export type ModelId = typeof AVAILABLE_MODELS[number]['id'] | string;
