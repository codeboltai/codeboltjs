import codebolt from '@codebolt/codeboltjs';
import { ThirdPartyAgents } from '@codebolt/thirdpartyagents';

let currentHandle: ReturnType<typeof ThirdPartyAgents.openclaw> | null = null;

codebolt.onMessage(async (userMessage: any) => {
    try {
        let messageContent = '';
        if (typeof userMessage === 'string') {
            messageContent = userMessage;
        } else if (userMessage && typeof userMessage === 'object') {
            messageContent = userMessage.userMessage
                || userMessage.content
                || userMessage.message
                || userMessage.text
                || '';
        }

        if (!messageContent.trim()) {
            console.log('[openclaw-thirdparty] Empty message, skipping');
            return;
        }

        const trimmed = messageContent.trim();
        console.log(`[openclaw-thirdparty] Message: "${trimmed.substring(0, 100)}"`);

        if (currentHandle && currentHandle.state === 'running') {
            console.log('[openclaw-thirdparty] Agent running — cannot send input to WebSocket executor');
            return;
        }

        // OpenClaw requires a gateway URL — check environment
        const gatewayUrl = process.env['OPENCLAW_GATEWAY_URL'] || process.env['OPENCLAW_URL'] || '';
        if (!gatewayUrl) {
            codebolt.notify.chat.AgentTextResponseNotify(
                'Error: OPENCLAW_GATEWAY_URL environment variable is required',
                true
            );
            codebolt.notify.system.AgentCompletionNotify('Missing OPENCLAW_GATEWAY_URL');
            return;
        }

        currentHandle = ThirdPartyAgents.openclaw(trimmed, {
            codebolt,
            url: gatewayUrl,
            authToken: process.env['OPENCLAW_AUTH_TOKEN'] || process.env['OPENCLAW_TOKEN'],
            sharedPassword: process.env['OPENCLAW_PASSWORD'],
        });

        for await (const msg of currentHandle.execute()) {
            switch (msg.type) {
                case 'init':
                    console.log(`[stream] init`);
                    break;
                case 'assistant_text':
                    console.log(`[stream] assistant_text: "${(msg.text || '').substring(0, 120)}"`);
                    break;
                case 'result':
                    console.log(`[stream] result: cost=$${msg.usage?.costUsd?.toFixed(4) ?? '?'}`);
                    break;
                case 'error':
                    console.log(`[stream] error: "${(msg.text || '').substring(0, 120)}"`);
                    break;
                default:
                    console.log(`[stream] ${msg.type}: "${(msg.text || '').substring(0, 80)}"`);
                    break;
            }
        }

        currentHandle = null;
    } catch (error) {
        currentHandle = null;
        console.error(`[openclaw-thirdparty] Error: ${error}`);
        codebolt.notify.chat.AgentTextResponseNotify(
            `Error: ${error instanceof Error ? error.message : String(error)}`,
            true
        );
        codebolt.notify.system.AgentCompletionNotify(
            `Error: ${error instanceof Error ? error.message : String(error)}`
        );
    }
});

console.log('[openclaw-thirdparty] Agent ready. Listening for messages.');
