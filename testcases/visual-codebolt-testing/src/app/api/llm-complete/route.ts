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
        // Send messages with llmrole: 'default' to use the configured default LLM
        const result = await llmModule.inference({ messages, llmrole: 'default' });

        // The inference returns { completion: LLMCompletion } structure
        // Extract the completion object which contains choices, usage, etc.
        const completion = result.completion || result;

        // Log for debugging
        console.log('[LLM API] Inference result keys:', Object.keys(result));
        console.log('[LLM API] Completion structure:', JSON.stringify(completion, null, 2).slice(0, 500));

        // Parse the response to determine if it's text or tool calls
        let responseType: 'text' | 'tool_calls' = 'text';
        let responseContent: string | LLMToolCall[] = '';

        // Handle OpenAI-style response format with choices array
        const message = completion?.choices?.[0]?.message || completion?.message || completion;

        if (message?.tool_calls && Array.isArray(message.tool_calls) && message.tool_calls.length > 0) {
          responseType = 'tool_calls';
          responseContent = message.tool_calls.map((tc: { id: string; function: { name: string; arguments: string } }) => ({
            id: tc.id || crypto.randomUUID(),
            toolName: tc.function?.name || 'unknown',
            arguments: JSON.parse(tc.function?.arguments || '{}'),
          }));
        } else {
          // Extract text content from various response formats
          responseContent = message?.content || completion?.content || completion?.message || JSON.stringify(completion);
        }

        // Extract usage from various locations
        const usage = completion?.usage || result?.usage || {};

        return NextResponse.json({
          success: true,
          response: {
            type: responseType,
            content: responseContent,
          },
          usage: {
            input_tokens: usage?.prompt_tokens || usage?.input_tokens || 0,
            output_tokens: usage?.completion_tokens || usage?.output_tokens || 0,
          },
          model: completion?.model || result?.model || model || 'default',
          timestamp: new Date().toISOString(),
        });
      }
    } catch (codeboltError) {
      // Log the full error for debugging
      console.error('[LLM API] Codebolt LLM error:', codeboltError);
      const errorMessage = codeboltError instanceof Error ? codeboltError.message : String(codeboltError);

      // If the error contains "Failed" or seems like a real LLM error, return it
      if (errorMessage.includes('Faild') || errorMessage.includes('Failed') || errorMessage.includes('Error')) {
        return NextResponse.json({
          success: false,
          error: errorMessage,
          timestamp: new Date().toISOString(),
        }, { status: 500 });
      }

      // Otherwise fall through to mock response
      console.log('[LLM API] Falling back to mock response');
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
