/**
 * Feedback Form Plugin — Sample CodeBolt Plugin (Child Process Architecture)
 *
 * This plugin runs as a child process and connects to the server via WebSocket.
 * It uses the full codeboltjs SDK for all interactions.
 *
 * Lifecycle:
 *   1. codeboltjs SDK connects to /plugin WebSocket endpoint
 *   2. Server sends pluginStartMessage → onPluginStart fires
 *   3. Plugin opens a DynamicPanel, listens for messages
 *   4. Server sends pluginStopMessage → onPluginStop fires for cleanup
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

import codebolt from '@codebolt/codeboltjs';
// import fs from 'fs';
// import path from 'path';

const PANEL_ID = 'feedback-form';
let submissionCount = 0;

// ---------------------------------------------------------------------------
// Plugin lifecycle using codeboltjs SDK
// ---------------------------------------------------------------------------

codebolt.onPluginStart(async (ctx) => {
    console.log(`[FeedbackFormPlugin] Started: ${ctx.pluginId}`);
    submissionCount = 0;

    // Read HTML from the ui/default/index.html file
    // const htmlPath = path.resolve(__dirname, '..', 'ui', 'default', 'index.html');
    // const FORM_HTML = fs.readFileSync(htmlPath, 'utf-8');

    // Open the feedback form panel using the full codeboltjs SDK
    // await codebolt.dynamicPanel.open(PANEL_ID, 'Feedback Form', FORM_HTML);
    console.log('[FeedbackFormPlugin] Panel opened');

    // Listen for messages from the panel
    codebolt.dynamicPanel.onMessage(PANEL_ID, (data: any) => {
        console.log('[FeedbackFormPlugin] Received panel message:', data);

        if (data.type === 'submit') {
            submissionCount++;
            console.log(`[FeedbackFormPlugin] Feedback from ${data.data.name}: [${data.data.category}] ${data.data.message}`);

            // Send acknowledgment back to the panel
            codebolt.dynamicPanel.send(PANEL_ID, {
                type: 'submission-ack',
                message: `Thank you, ${data.data.name}! Your ${data.data.category} feedback has been received.`,
            });

            // Push updated stats
            codebolt.dynamicPanel.send(PANEL_ID, {
                type: 'stats',
                count: submissionCount,
            });
        }
    });
});

codebolt.onPluginStop(async () => {
    console.log('[FeedbackFormPlugin] Stopping...');
    await codebolt.dynamicPanel.close(PANEL_ID);
    console.log(`[FeedbackFormPlugin] Stopped. Total submissions: ${submissionCount}`);
});
