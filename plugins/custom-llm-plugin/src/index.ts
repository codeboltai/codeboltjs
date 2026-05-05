/**
 * Custom LLM Plugin
 *
 * Example plugin that registers itself as a custom LLM provider via the
 * plugin SDK's llmProvider module. The server will route createCompletion
 * and streamCompletion calls for this provider to this plugin over the
 * /plugin WebSocket connection.
 *
 * Replace the canned response logic in handleCompletion / handleStream
 * with calls to your real backend (proprietary gateway, internal model, etc.).
 */

import plugin from '@codebolt/plugin-sdk';

// Loaded dynamically so the plugin compiles against older copies of
// @codebolt/plugin-sdk that don't yet export llmProvider. The runtime
// SDK installed in ~/.codebolt/plugins/<this>/node_modules MUST be a
// build that includes the llmProvider module — rebuild & reinstall the
// SDK if registration silently no-ops.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sdkRequire: any = require('@codebolt/plugin-sdk');
const llmProvider: any = sdkRequire.llmProvider ?? sdkRequire.default?.llmProvider;

const PROVIDER_ID = 'custom-llm';
const PROVIDER_NAME = 'Custom LLM';

// =============================================================================
// Replace these stubs with calls to your real LLM backend.
// =============================================================================

/**
 * Build a non-streaming response. Shape matches multillm ChatCompletionResponse.
 */
async function generateCompletion(options: any): Promise<any> {
    // The server injects the user-configured key/apiUrl here. For built-in
    // requiresKey providers this comes from the standard "Add Key" UI flow.
    const cfg = options?.providerConfig || {};
    if (!cfg.apiKey) {
        throw new Error('No API key configured for Custom LLM. Add one in Settings → LLM Providers.');
    }
    // TODO: call your real backend with cfg.apiKey / cfg.apiUrl / cfg.custom
    console.log(`[CustomLlmPlugin] using apiKey=${String(cfg.apiKey).slice(0, 6)}…  apiUrl=${cfg.apiUrl || '(default)'}`);

    const lastMessage = options?.messages?.[options.messages.length - 1];
    const userText =
        typeof lastMessage?.content === 'string'
            ? lastMessage.content
            : Array.isArray(lastMessage?.content)
                ? lastMessage.content.map((p: any) => p.text || '').join('')
                : '';

    const reply = `[custom-llm] You said: ${userText}`;
    return {
        id: `custom-${Date.now()}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: options?.model || 'custom-fast',
        choices: [
            {
                index: 0,
                message: { role: 'assistant', content: reply },
                finish_reason: 'stop',
            },
        ],
        usage: {
            prompt_tokens: userText.length,
            completion_tokens: reply.length,
            total_tokens: userText.length + reply.length,
        },
    };
}

/**
 * Generate a list of streaming chunks. Shape matches multillm StreamChunk.
 */
function buildStreamChunks(options: any): { chunks: any[]; finalResponse: any } {
    const finalResponse = {
        id: `custom-${Date.now()}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: options?.model || 'custom-fast',
        choices: [
            {
                index: 0,
                message: { role: 'assistant', content: '' },
                finish_reason: 'stop',
            },
        ],
    };

    const text = `[custom-llm stream] Hello from the custom plugin provider.`;
    const tokens = text.split(' ');
    const chunks = tokens.map((token, i) => ({
        id: finalResponse.id,
        object: 'chat.completion.chunk',
        created: finalResponse.created,
        model: finalResponse.model,
        choices: [
            {
                index: 0,
                delta: {
                    role: i === 0 ? 'assistant' : undefined,
                    content: i === 0 ? token : ' ' + token,
                },
                finish_reason: i === tokens.length - 1 ? 'stop' : null,
            },
        ],
    }));

    finalResponse.choices[0].message.content = text;
    return { chunks, finalResponse };
}

// =============================================================================
// Plugin lifecycle
// =============================================================================

plugin.onStart(async (ctx) => {
    console.log(`[CustomLlmPlugin] Starting (pluginId: ${ctx.pluginId})`);

    if (!llmProvider) {
        console.error('[CustomLlmPlugin] llmProvider module missing from @codebolt/plugin-sdk in this plugin\'s node_modules. Rebuild the SDK and reinstall.');
        return;
    }

    // 1. Register as a custom LLM provider with the server.
    try {
        const result = await llmProvider.register({
            providerId: PROVIDER_ID,
            name: PROVIDER_NAME,
            description: 'Example custom LLM provider implemented as a plugin',
            capabilities: ['chat'],
            // Ask the user for an API key via the standard settings UI flow.
            // The saved key is forwarded as `req.options.providerConfig.apiKey`.
            requiresKey: true,
            configFields: [
                { key: 'apiKey', label: 'API Key', type: 'password', required: true,
                  placeholder: 'sk-…' },
                { key: 'apiUrl', label: 'Base URL', type: 'url',
                  placeholder: 'https://api.example.com/v1' },
            ],
            models: [
                { id: 'custom-fast', name: 'Custom Fast' },
                { id: 'custom-pro', name: 'Custom Pro' },
            ],
        });

        if (!result?.success) {
            console.error(`[CustomLlmPlugin] Failed to register provider: ${result?.error}`);
            return;
        }
        console.log(`[CustomLlmPlugin] Registered provider "${PROVIDER_ID}"`);
    } catch (error: any) {
        console.error('[CustomLlmPlugin] Error registering provider:', error?.message || error);
        return;
    }

    // 2. Handle non-streaming completion requests.
    llmProvider.onCompletionRequest(async (req: any) => {
        console.log(`[CustomLlmPlugin] completionRequest ${req.requestId} model=${req.options?.model}`);
        try {
            const response = await generateCompletion(req.options);
            llmProvider.sendReply(req.requestId, response, true);
        } catch (error: any) {
            console.error('[CustomLlmPlugin] completion error:', error?.message || error);
            llmProvider.sendError(req.requestId, error?.message || 'Unknown error');
        }
    });

    // 3. Handle streaming completion requests.
    llmProvider.onStreamRequest(async (req: any) => {
        console.log(`[CustomLlmPlugin] streamRequest ${req.requestId} model=${req.options?.model}`);
        try {
            const { chunks, finalResponse } = buildStreamChunks(req.options);
            for (const chunk of chunks) {
                llmProvider.sendChunk(req.requestId, chunk);
                // Tiny delay so the UI sees a real stream
                await new Promise((r) => setTimeout(r, 30));
            }
            llmProvider.sendReply(req.requestId, finalResponse, true);
        } catch (error: any) {
            console.error('[CustomLlmPlugin] stream error:', error?.message || error);
            llmProvider.sendError(req.requestId, error?.message || 'Unknown error');
        }
    });

    console.log('[CustomLlmPlugin] Ready');
});

plugin.onStop(async () => {
    console.log('[CustomLlmPlugin] Stopping...');
    try {
        if (llmProvider) {
            await llmProvider.unregister(PROVIDER_ID);
        }
    } catch (error: any) {
        console.warn('[CustomLlmPlugin] Error unregistering provider:', error?.message || error);
    }
    console.log('[CustomLlmPlugin] Stopped');
});
