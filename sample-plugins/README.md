# CodeBolt Sample Plugins

Two sample plugins demonstrating the DynamicPanel + Plugin system.

## How Plugins Interact with the System

### Architecture Overview

```
┌─────────────────────┐       ┌──────────────────────┐       ┌──────────────────────┐
│   Plugin (server)   │       │   Server (broker)    │       │  Electron UI (panel) │
│                     │       │                      │       │                      │
│  initialize(ctx)    │       │  pluginService       │       │  CbDockView          │
│  start()            │◄─────►│  dynamicPanelService │◄─────►│  DynamicPanelComponent│
│  stop()             │       │  applicationEventBus │       │  <iframe srcdoc>     │
└─────────────────────┘       └──────────────────────┘       └──────────────────────┘
```

### Plugin Lifecycle

```
plugin.load    →  [Loaded]       Discovers package.json with codebolt.plugin key
plugin.start   →  [Initialized]  Requires main entry, calls module.initialize(ctx)
                   [Started]      Calls module.start()
plugin.stop    →  [Stopped]      Calls module.stop(), closes panels, unsubscribes events
```

### Communication Channels

| Direction | Method | Description |
|---|---|---|
| Plugin → Panel | `ctx.openPanel(id, title, html)` | Open a new panel with HTML content |
| Plugin → Panel | `ctx.sendToPanel(id, data)` | Push data into the iframe via postMessage |
| Plugin → Panel | `ctx.updatePanel(id, html)` | Replace the panel's HTML entirely |
| Plugin → Panel | `ctx.closePanel(id)` | Close and remove the panel |
| Panel → Plugin | `ctx.onPanelMessage(id, handler)` | Receive messages from iframe's `parent.postMessage()` |
| Plugin → EventBus | `ctx.onEvent(types, handler)` | Subscribe to system-wide application events |

### What Iframe HTML Authors Write

```html
<script>
  // Send data to plugin (triggers onPanelMessage handler)
  window.parent.postMessage({ type: 'submit', data: { name: 'John' } }, '*');

  // Receive data from plugin (sent via ctx.sendToPanel)
  window.addEventListener('message', (e) => {
    console.log('From plugin:', e.data);
  });
</script>
```

## Plugin Directory

Plugins are discovered from two locations (per-project overrides global):

| Location | Path |
|---|---|
| Per-project | `{projectPath}/.codeboltPlugins/{plugin-name}/` |
| Global | `~/.codebolt/plugins/{plugin-name}/` |

## Plugin Manifest (package.json)

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "main": "dist/index.js",
  "codebolt": {
    "plugin": {
      "triggers": [
        { "type": "startup" },
        { "type": "event", "eventTypes": ["conversation:started"] },
        { "type": "manual" }
      ]
    }
  }
}
```

**Trigger types:**
- `startup` — Auto-starts when plugins are loaded
- `event` — Starts when a specific ApplicationEventBus event fires
- `manual` — Only starts via explicit `plugin.start` CLI/API call

## Plugin Module Exports

```typescript
// dist/index.js must export these functions:
module.exports = {
  initialize(ctx) { /* store ctx, set up state */ },
  start()         { /* open panels, subscribe to events */ },
  stop()          { /* close panels, clean up */ },
};
```

## Installation (for testing)

Copy a sample plugin into your project's plugin directory:

```bash
# From the CodeBolt project root
cp -r packages/sample-plugins/feedback-form-plugin .codeboltPlugins/feedback-form-plugin
```

Then use the CLI or REST API to load and start it:

```bash
# Via CLI WebSocket message:
{ "type": "plugin.load" }
{ "type": "plugin.start", "params": { "pluginId": "feedback-form-plugin" } }

# Via REST API:
POST /plugins/load
POST /plugins/feedback-form-plugin/start
```

## Sample 1: Feedback Form (`feedback-form-plugin`)

**Trigger:** Manual — must be explicitly started.

Demonstrates the **async message loop** pattern:
1. Opens a styled feedback form in a DynamicPanel
2. User fills out and submits the form
3. Plugin receives the data via `onPanelMessage`
4. Plugin sends acknowledgment back via `sendToPanel`
5. Plugin subscribes to application events and forwards them to the panel

## Sample 2: Quick Input (`quick-input-plugin`)

**Trigger:** Startup — auto-starts when plugins are loaded.

Demonstrates the **waitForResponse (blocking)** pattern:
1. Opens a configuration form with `waitForResponse: true`
2. The `openPanel()` call **blocks** (returns a pending Promise)
3. User fills out and submits the form
4. The Promise resolves with the submitted form data
5. Plugin continues execution with the user's input

This pattern is ideal for agent workflows that need user input before proceeding.
