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

const PANEL_ID = 'feedback-form';
let submissionCount = 0;

// ---------------------------------------------------------------------------
// HTML rendered inside the DynamicPanel iframe
// ---------------------------------------------------------------------------
const FORM_HTML = `
<!DOCTYPE html>
<html>
<head>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 24px;
      background: #1e1e2e;
      color: #cdd6f4;
    }
    h2 { margin-bottom: 16px; color: #89b4fa; }
    .form-group { margin-bottom: 16px; }
    label { display: block; margin-bottom: 4px; font-size: 13px; color: #a6adc8; }
    input, textarea, select {
      width: 100%; padding: 8px 12px; border: 1px solid #45475a;
      border-radius: 6px; background: #313244; color: #cdd6f4;
      font-size: 14px; outline: none;
    }
    input:focus, textarea:focus, select:focus { border-color: #89b4fa; }
    textarea { resize: vertical; min-height: 80px; }
    button {
      background: #89b4fa; color: #1e1e2e; border: none; padding: 10px 20px;
      border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer;
    }
    button:hover { background: #74c7ec; }
    .status { margin-top: 16px; padding: 12px; border-radius: 6px; display: none; }
    .status.success { display: block; background: #a6e3a1; color: #1e1e2e; }
    .status.info { display: block; background: #313244; color: #89b4fa; border: 1px solid #45475a; }
  </style>
</head>
<body>
  <h2>Feedback Form</h2>
  <form id="feedbackForm">
    <div class="form-group">
      <label for="name">Your Name</label>
      <input type="text" id="name" name="name" placeholder="Enter your name" required />
    </div>
    <div class="form-group">
      <label for="category">Category</label>
      <select id="category" name="category">
        <option value="bug">Bug Report</option>
        <option value="feature">Feature Request</option>
        <option value="general">General Feedback</option>
      </select>
    </div>
    <div class="form-group">
      <label for="message">Message</label>
      <textarea id="message" name="message" placeholder="Describe your feedback..." required></textarea>
    </div>
    <button type="submit">Submit Feedback</button>
  </form>

  <div id="status" class="status"></div>

  <script>
    document.getElementById('feedbackForm').addEventListener('submit', function(e) {
      e.preventDefault();
      const formData = Object.fromEntries(new FormData(e.target));
      window.parent.postMessage({ type: 'submit', data: formData }, '*');
    });

    window.addEventListener('message', function(e) {
      const msg = e.data;
      if (msg.type === 'submission-ack') {
        const el = document.getElementById('status');
        el.className = 'status success';
        el.textContent = msg.message;
        document.getElementById('feedbackForm').reset();
      }
      if (msg.type === 'stats') {
        const el = document.getElementById('status');
        el.className = 'status info';
        el.textContent = 'Total submissions this session: ' + msg.count;
      }
    });
  </script>
</body>
</html>
`;

// ---------------------------------------------------------------------------
// Plugin lifecycle using codeboltjs SDK
// ---------------------------------------------------------------------------

codebolt.onPluginStart(async (ctx) => {
    console.log(`[FeedbackFormPlugin] Started: ${ctx.pluginId}`);
    submissionCount = 0;

    // Open the feedback form panel using the full codeboltjs SDK
    await codebolt.dynamicPanel.open(PANEL_ID, 'Feedback Form', FORM_HTML);
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
