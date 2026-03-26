/**
 * Feedback Form Plugin — Sample CodeBolt Plugin (Child Process Architecture)
 *
 * This plugin runs as a child process and connects to the server via WebSocket.
 * It uses the @codebolt/plugin-sdk for all interactions.
 *
 * Lifecycle:
 *   1. Plugin SDK connects to /plugin WebSocket endpoint
 *   2. Server sends pluginStartMessage → onStart fires
 *   3. Plugin opens a DynamicPanel, listens for messages
 *   4. Server sends pluginStopMessage → onStop fires for cleanup
 *
 * Communication flow:
 *
 *   Plugin (child process)              DynamicPanel (iframe in UI)
 *        |                                    |
 *        |--- dynamicPanel.open(html) ------->|  (panel opens in dockview)
 *        |                                    |
 *        |--- dynamicPanel.send(data) ------->|  (iframe receives via postMessage)
 *        |                                    |
 *        |<-- dynamicPanel.message ----------|  (iframe calls parent.postMessage)
 *        |                                    |
 *        |--- dynamicPanel.close() ---------->|  (panel removed from dockview)
 */

import plugin from '@codebolt/plugin-sdk';

let submissionCount = 0;

// ---------------------------------------------------------------------------
// Plugin lifecycle using @codebolt/plugin-sdk
// ---------------------------------------------------------------------------

plugin.onStart(async (ctx) => {
    console.log(`[FeedbackFormPlugin] Started: ${ctx.pluginId}`);
    submissionCount = 0;

    // Panel ID matches the one registered by the /pluginui/:pluginId route
    const PANEL_ID = `plugin-ui-${ctx.pluginId}`;
    console.log(`[FeedbackFormPlugin] Listening on panel: ${PANEL_ID}`);

    // Listen for messages from the plugin UI panel
    plugin.dynamicPanel.onMessage(PANEL_ID, (data: any) => {
        console.log('[FeedbackFormPlugin] Received panel message:', data);

        if (data.type === 'submit') {
            submissionCount++;
            console.log(`[FeedbackFormPlugin] Feedback from ${data.data.name}: [${data.data.category}] ${data.data.message}`);

            // Send acknowledgment back to the panel
            plugin.dynamicPanel.send(PANEL_ID, {
                type: 'submission-ack',
                message: `Thank you, ${data.data.name}! Your ${data.data.category} feedback has been received.`,
            });

            // Push updated stats
            plugin.dynamicPanel.send(PANEL_ID, {
                type: 'stats',
                count: submissionCount,
            });
        }
    });
});

plugin.onStop(async () => {
    console.log(`[FeedbackFormPlugin] Stopped. Total submissions: ${submissionCount}`);
});
