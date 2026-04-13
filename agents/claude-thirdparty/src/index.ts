import codebolt from '@codebolt/codeboltjs';
import { ThirdPartyAgents } from '@codebolt/thirdpartyagents';

let currentHandle: ReturnType<typeof ThirdPartyAgents.claude> | null = null;

codebolt.onMessage(async (userMessage: any) => {
    try {
        // Extract message content
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
            console.log('[claude-thirdparty] Empty message, skipping');
            return;
        }

        const trimmed = messageContent.trim();
        console.log(`[claude-thirdparty] Message: "${trimmed.substring(0, 100)}"`);

        // If an agent is already running, send input to its stdin
        if (currentHandle && currentHandle.state === 'running') {
            console.log('[claude-thirdparty] Agent running — sending to stdin');
            currentHandle.sendInput(trimmed);
            return;
        }

        const { projectPath } = await codebolt.project.getProjectPath();

        // Parse permission mode from /plan or /execute commands
        let prompt = trimmed;
        let permissionMode: 'plan' | 'bypassPermissions' = 'bypassPermissions';
        if (trimmed.startsWith('/plan ')) {
            permissionMode = 'plan';
            prompt = trimmed.slice(6).trim();
        } else if (trimmed.startsWith('/execute ')) {
            prompt = trimmed.slice(9).trim();
        }

        // Create and run the third-party agent
        // The library handles ALL codebolt communication automatically
        currentHandle = ThirdPartyAgents.claude(prompt, {
            codebolt,
            cwd: projectPath || process.cwd(),
            permissionMode,
        });

        for await (const msg of currentHandle.execute()) {
            // Library already dispatched everything to codebolt.notify.*
            // We can do additional logging/processing here
            if (msg.type === 'tool_use') {
                console.log(`[claude-thirdparty] Tool: ${msg.toolName}`);
            } else if (msg.type === 'result') {
                console.log(`[claude-thirdparty] Done. Cost: $${msg.usage?.costUsd?.toFixed(4) ?? '?'}`);
            }
        }

        currentHandle = null;
    } catch (error) {
        currentHandle = null;
        console.error(`[claude-thirdparty] Error: ${error}`);
        codebolt.notify.chat.AgentTextResponseNotify(
            `Error: ${error instanceof Error ? error.message : String(error)}`,
            true
        );
        codebolt.notify.system.AgentCompletionNotify(
            `Error: ${error instanceof Error ? error.message : String(error)}`
        );
    }
});

console.log('[claude-thirdparty] Agent ready. Listening for messages.');
