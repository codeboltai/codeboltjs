/**
 * Linear Agent Plugin — CodeBolt Plugin
 *
 * Connects to the Linear Agent Cloudflare Worker via WebSocket to receive
 * agent sessions (from Linear webhooks) and processes them via CodeBolt agents.
 * Results are sent back through the WebSocket to the worker, which relays
 * them to Linear as agent activities.
 */

import plugin from '@codebolt/plugin-sdk';
import { loadConfig, saveConfig, type LinearPluginConfig } from './config/store.js';
import { WorkerClient } from './ws/workerClient.js';
import { SessionHandler } from './session/handler.js';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

let workerClient: WorkerClient | null = null;
let handler: SessionHandler | null = null;
let config: LinearPluginConfig;
let pluginDir: string;

const PANEL_ID = 'plugin-ui-linear-agent-plugin';

// ---------------------------------------------------------------------------
// UI panel communication — registered at module level (like telegram plugin)
// ---------------------------------------------------------------------------

plugin.dynamicPanel.onMessage(PANEL_ID, async (data: any) => {
    console.log(`[LinearAgent] UI message received: ${data?.type}`);

    switch (data.type) {
        case 'get-config': {
            plugin.dynamicPanel.send(PANEL_ID, {
                type: 'config',
                config,
                isConnected: workerClient?.connected ?? false,
                activeSessions: handler?.activeSessionCount ?? 0,
            });
            break;
        }

        case 'save-config': {
            if (data.workerUrl !== undefined && data.workerUrl !== '') {
                config.workerUrl = data.workerUrl;
            }
            if (data.appToken !== undefined && data.appToken !== '') {
                config.appToken = data.appToken;
            }
            if (typeof data.enabled === 'boolean') {
                config.enabled = data.enabled;
            }
            await saveConfig(pluginDir, config);
            await restartConnection();
            plugin.dynamicPanel.send(PANEL_ID, {
                type: 'config-saved',
                success: true,
            });
            break;
        }

        case 'test-connection': {
            console.log('[LinearAgent] Test connection requested');
            if (!config.appToken) {
                plugin.dynamicPanel.send(PANEL_ID, {
                    type: 'test-result',
                    valid: false,
                    error: 'App Token is required',
                });
                return;
            }

            try {
                const healthUrl = config.workerUrl.replace(/^wss:/, 'https:').replace(/^ws:/, 'http:') + '/health';
                console.log(`[LinearAgent] Testing health endpoint: ${healthUrl}`);
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 10000);
                const response = await fetch(healthUrl, { signal: controller.signal });
                clearTimeout(timeout);
                console.log(`[LinearAgent] Health response: ${response.status}`);
                if (response.ok) {
                    plugin.dynamicPanel.send(PANEL_ID, {
                        type: 'test-result',
                        valid: true,
                        name: 'Worker is reachable',
                    });
                } else {
                    plugin.dynamicPanel.send(PANEL_ID, {
                        type: 'test-result',
                        valid: false,
                        error: `Worker returned status ${response.status}`,
                    });
                }
            } catch (err) {
                const errorMsg = err instanceof Error ? err.message : 'Connection failed';
                const isTimeout = err instanceof Error && err.name === 'AbortError';
                console.error(`[LinearAgent] Test failed: ${isTimeout ? 'Timed out after 10s' : errorMsg}`);
                plugin.dynamicPanel.send(PANEL_ID, {
                    type: 'test-result',
                    valid: false,
                    error: isTimeout ? 'Connection timed out (10s)' : errorMsg,
                });
            }
            break;
        }

        case 'get-sessions': {
            plugin.dynamicPanel.send(PANEL_ID, {
                type: 'sessions',
                sessions: [],
                activeSessions: handler?.activeSessionCount ?? 0,
                info: workerClient?.connected
                    ? 'Sessions are received in real-time via WebSocket.'
                    : 'Not connected — configure settings first',
            });
            break;
        }
    }
});

// ---------------------------------------------------------------------------
// Worker connection management
// ---------------------------------------------------------------------------

function startConnection(): void {
    if (!config.appToken) return;

    workerClient = new WorkerClient(
        config.workerUrl,
        config.appToken,
        config.reconnectIntervalMs
    );

    handler = new SessionHandler(workerClient);

    workerClient.on('connected', () => {
        console.log('[LinearAgent] Connected to worker');
    });

    workerClient.on('disconnected', () => {
        console.log('[LinearAgent] Disconnected from worker');
    });

    workerClient.on('session:new', (event) => {
        console.log(`[LinearAgent] New session: ${event.sessionId}`);
        handler!.handleNewSession(event).catch((err) => {
            console.error('[LinearAgent] Session handling failed:', err);
        });
    });

    workerClient.on('session:prompted', (event) => {
        console.log(`[LinearAgent] Session prompted: ${event.sessionId}`);
        handler!.handlePrompted(event.sessionId, event.message).catch((err) => {
            console.error('[LinearAgent] Prompt handling failed:', err);
        });
    });

    workerClient.on('error', (err) => {
        console.error('[LinearAgent] Worker client error:', err.message);
    });

    workerClient.connect();
    console.log(`[LinearAgent] Connecting to ${config.workerUrl}`);
}

function stopConnection(): void {
    if (workerClient) {
        workerClient.disconnect();
        workerClient = null;
    }
    if (handler) {
        handler.cancelAll();
        handler = null;
    }
}

async function restartConnection(): Promise<void> {
    stopConnection();
    if (config.appToken && config.enabled) {
        startConnection();
    }
}

// ---------------------------------------------------------------------------
// Plugin lifecycle
// ---------------------------------------------------------------------------

plugin.onStart(async (ctx: any) => {
    console.log(`[LinearAgent] Started: ${ctx.pluginId}`);
    pluginDir = (ctx as any).pluginDir ?? process.env.PLUGIN_DIR ?? '.';

    config = await loadConfig(pluginDir);

    if (config.appToken && config.enabled) {
        startConnection();
    } else {
        console.log('[LinearAgent] Not configured — waiting for configuration via UI');
    }
});

plugin.onStop(async () => {
    console.log('[LinearAgent] Stopping...');
    stopConnection();
    console.log('[LinearAgent] Stopped');
});
