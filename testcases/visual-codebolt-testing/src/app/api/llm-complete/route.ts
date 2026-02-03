import { NextRequest, NextResponse } from 'next/server';
import codebolt from '@codebolt/codeboltjs';

// Ensure environment variables are set
if (!process.env.SOCKET_PORT) {
  process.env.SOCKET_PORT = '12345';
}
if (!process.env.CODEBOLT_SERVER_URL) {
  process.env.CODEBOLT_SERVER_URL = 'localhost';
}

interface LLMMessage {
  role: string;
  content: string;
  tool_call_id?: string;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: { name: string; arguments: string };
  }>;
}

interface LLMToolCall {
  id: string;
  toolName: string;
  arguments: Record<string, unknown>;
}

async function ensureInitialized(): Promise<void> {
  await codebolt.waitForReady();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Model is now optional - will use codebolt's default if not specified
    const { model, messages } = body as { model?: string; messages: LLMMessage[] };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Try to use codebolt's LLM module if available
    try {
      await ensureInitialized();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const llmModule = (codebolt as any).llm;

      if (llmModule && typeof llmModule.inference === 'function') {
        // Build inference params - only include model if specified and not "default"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const inferenceParams: any = { messages };

        if (model && model !== 'default') {
          inferenceParams.model = model;
        }

        const result = await llmModule.inference(inferenceParams);

        // Parse the response to determine if it's text or tool calls
        let responseType: 'text' | 'tool_calls' = 'text';
        let responseContent: string | LLMToolCall[] = '';

        if (result.tool_calls && Array.isArray(result.tool_calls) && result.tool_calls.length > 0) {
          responseType = 'tool_calls';
          responseContent = result.tool_calls.map((tc: { id: string; function: { name: string; arguments: string } }) => ({
            id: tc.id || crypto.randomUUID(),
            toolName: tc.function?.name || 'unknown',
            arguments: JSON.parse(tc.function?.arguments || '{}'),
          }));
        } else {
          responseContent = result.content || result.message || JSON.stringify(result);
        }

        return NextResponse.json({
          success: true,
          response: {
            type: responseType,
            content: responseContent,
          },
          usage: {
            input_tokens: result.usage?.prompt_tokens || result.usage?.input_tokens || 0,
            output_tokens: result.usage?.completion_tokens || result.usage?.output_tokens || 0,
          },
          model: result.model || model || 'default',
          timestamp: new Date().toISOString(),
        });
      }
    } catch (codeboltError) {
      console.log('[LLM API] Codebolt LLM not available, using mock response:', codeboltError);
    }

    // Fallback: Return a mock response for testing
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    const mockContent = lastUserMessage
      ? `This is a simulated response to: "${typeof lastUserMessage.content === 'string' ? lastUserMessage.content.slice(0, 100) : 'your message'}". In production, this would connect to an actual LLM API.`
      : 'This is a simulated LLM response. Configure your LLM API keys to get real responses.';

    // Simulate some token counts
    const inputTokens = messages.reduce((sum, m) => {
      const content = typeof m.content === 'string' ? m.content : JSON.stringify(m.content);
      return sum + Math.ceil(content.length / 4);
    }, 0);
    const outputTokens = Math.ceil(mockContent.length / 4);

    return NextResponse.json({
      success: true,
      response: {
        type: 'text',
        content: mockContent,
      },
      usage: {
        input_tokens: inputTokens,
        output_tokens: outputTokens,
      },
      model: model || 'mock',
      timestamp: new Date().toISOString(),
      mock: true,
    });

  } catch (error) {
    console.error('[LLM API] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Try to get available models from codebolt
  let availableModels: string[] = ['default'];

  try {
    await ensureInitialized();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const llmModule = (codebolt as any).llm;

    // Try to get model list from codebolt if available
    if (llmModule && typeof llmModule.getModels === 'function') {
      const models = await llmModule.getModels();
      if (Array.isArray(models) && models.length > 0) {
        availableModels = ['default', ...models];
      }
    } else if (llmModule && typeof llmModule.getProviders === 'function') {
      const providers = await llmModule.getProviders();
      if (Array.isArray(providers)) {
        availableModels = ['default', ...providers.map((p: { id?: string; name?: string }) => p.id || p.name).filter((x): x is string => Boolean(x))];
      }
    }
  } catch (e) {
    console.log('[LLM API] Could not fetch models from codebolt:', e);
  }

  return NextResponse.json({
    status: 'available',
    message: 'LLM Completion API endpoint. Use POST to send messages.',
    usage: {
      method: 'POST',
      body: {
        model: 'string (optional) - Model ID or "default" to use configured default',
        messages: 'array - Array of message objects with role and content',
      },
    },
    availableModels,
    note: 'Model is optional. If not specified or set to "default", the codebolt configured default model will be used.',
  });
}
