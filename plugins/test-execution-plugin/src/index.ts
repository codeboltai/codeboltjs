/**
 * Test Execution Plugin (DUMMY)
 *
 * Simple test plugin that:
 * 1. Claims the ExecutionGateway
 * 2. Replies with dummy "hello" content to every execution request
 * 3. Logs notifications it receives
 */

import plugin from '@codebolt/plugin-sdk';

console.log('[TestExecutionPlugin] Module loaded — waiting for onStart');

/**
 * Build a response matching the format the agent SDK expects for each request type.
 * The response type is typically "{action}Response" (e.g., readFile → readFileResponse).
 * The plugin must return the correct shape or the agent SDK won't recognize it.
 */
function buildReplyForRequest(request: any): any {
    const { originalType, originalAction, originalMessage } = request;
    const params = originalMessage?.message || originalMessage?.params || originalMessage || {};

    // FSEvent responses
    if (originalType === 'fsEvent' || originalType === 'FSEvent') {
        switch (originalAction) {
            case 'readFile':
                return {
                    type: 'readFileResponse',
                    success: true,
                    path: params.filePath || params.path || '',
                    content: `[test-execution-plugin] dummy content for: ${params.filePath || params.path || 'unknown'}`,
                    encoding: 'utf-8',
                    size: 0,
                };
            case 'createFile':
            case 'writeToFile':
            case 'updateFile':
                return {
                    type: 'writeFileResponse',
                    success: true,
                    path: params.filePath || params.path || '',
                    message: '[test-execution-plugin] dummy write success',
                };
            case 'listDirectory':
            case 'listFiles':
                return {
                    type: 'listDirectoryResponse',
                    success: true,
                    path: params.dirPath || params.path || '',
                    entries: [],
                };
            default:
                return {
                    type: `${originalAction}Response`,
                    success: true,
                    message: `[test-execution-plugin] handled ${originalAction}`,
                };
        }
    }

    // Terminal responses
    if (originalType === 'executeCommand' || originalType === 'ExecuteCommand') {
        return {
            type: 'commandExecutionResponse',
            success: true,
            output: '[test-execution-plugin] dummy command output',
            exitCode: 0,
        };
    }

    // Generic fallback — return a type based on the action or message type
    const responseType = originalAction
        ? `${originalAction}Response`
        : `${originalType}Response`;

    return {
        type: responseType,
        success: true,
        message: `[test-execution-plugin] handled ${originalType}:${originalAction || 'default'}`,
        handledBy: 'test-execution-plugin',
        timestamp: new Date().toISOString(),
    };
}

plugin.onStart(async (ctx) => {
    console.log(`[TestExecutionPlugin] onStart fired (pluginId: ${ctx.pluginId})`);
    console.log(`[TestExecutionPlugin] ctx:`, JSON.stringify(ctx));

    // 1. Claim the ExecutionGateway
    try {
        console.log('[TestExecutionPlugin] Sending executionGateway.claim...');
        const claimResult = await plugin.executionGateway.claim();
        console.log('[TestExecutionPlugin] Claim result:', JSON.stringify(claimResult));
        if (!claimResult.success) {
            console.error(`[TestExecutionPlugin] Failed to claim gateway: ${claimResult.error}`);
            return;
        }
        console.log('[TestExecutionPlugin] Successfully claimed ExecutionGateway');
    } catch (error) {
        console.error('[TestExecutionPlugin] Error claiming gateway:', error);
        return;
    }

    // 2. Subscribe to notifications
    try {
        console.log('[TestExecutionPlugin] Sending executionGateway.subscribe...');
        const subResult = await plugin.executionGateway.subscribe();
        console.log('[TestExecutionPlugin] Subscribe result:', JSON.stringify(subResult));
    } catch (error) {
        console.error('[TestExecutionPlugin] Error subscribing to notifications:', error);
    }

    // 3. Handle incoming execution requests — reply with correct response format
    plugin.executionGateway.onRequest(async (request) => {
        console.log(`[TestExecutionPlugin] Received request: ${request.requestId} (type: ${request.originalType}, action: ${request.originalAction})`);
        console.log(`[TestExecutionPlugin] Request payload:`, JSON.stringify(request.originalMessage));

        // Build a response that matches the format the agent SDK expects.
        // Each message type has its own response shape (e.g., readFileResponse).
        const reply = buildReplyForRequest(request);

        console.log(`[TestExecutionPlugin] Sending reply for request ${request.requestId}:`, JSON.stringify(reply));
        plugin.executionGateway.sendReply(request.requestId, reply, true);
    });

    // 4. Log notifications
    plugin.executionGateway.onNotification((notification) => {
        console.log(`[TestExecutionPlugin] Notification received (type: ${notification.originalType}):`, JSON.stringify(notification));
    });

    console.log('[TestExecutionPlugin] Ready — will reply "hello" to all execution requests');
});

plugin.onStop(async () => {
    console.log('[TestExecutionPlugin] Stopping...');

    try {
        await plugin.executionGateway.relinquish();
    } catch (error) {
        console.warn('[TestExecutionPlugin] Error relinquishing gateway:', error);
    }

    console.log('[TestExecutionPlugin] Stopped');
});
