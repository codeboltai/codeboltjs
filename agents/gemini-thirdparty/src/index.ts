import codebolt from '@codebolt/codeboltjs';
import { ThirdPartyAgents } from '@codebolt/thirdpartyagents';

let currentHandle: ReturnType<typeof ThirdPartyAgents.gemini> | null = null;

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
            console.log('[gemini-thirdparty] Empty message, skipping');
            return;
        }

        const trimmed = messageContent.trim();
        console.log(`[gemini-thirdparty] Message: "${trimmed.substring(0, 100)}"`);

        if (currentHandle && currentHandle.state === 'running') {
            console.log('[gemini-thirdparty] Agent running — sending to stdin');
            currentHandle.sendInput(trimmed);
            return;
        }

        const { projectPath } = await codebolt.project.getProjectPath();

        currentHandle = ThirdPartyAgents.gemini(trimmed, {
            codebolt,
            cwd: projectPath || process.cwd(),
        });

        for await (const msg of currentHandle.execute()) {
            switch (msg.type) {
                case 'init':
                    console.log(`[stream] init: model=${msg.model} sessionId=${msg.sessionId}`);
                    break;
                case 'assistant_text':
                    console.log(`[stream] assistant_text: "${(msg.text || '').substring(0, 120)}"`);
                    break;
                case 'result':
                    console.log(`[stream] result: cost=$${msg.usage?.costUsd?.toFixed(4) ?? '?'} tokens_in=${msg.usage?.inputTokens ?? '?'} tokens_out=${msg.usage?.outputTokens ?? '?'}`);
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
        console.error(`[gemini-thirdparty] Error: ${error}`);
        codebolt.notify.chat.AgentTextResponseNotify(
            `Error: ${error instanceof Error ? error.message : String(error)}`,
            true
        );
        codebolt.notify.system.AgentCompletionNotify(
            `Error: ${error instanceof Error ? error.message : String(error)}`
        );
    }
});

console.log('[gemini-thirdparty] Agent ready. Listening for messages.');
