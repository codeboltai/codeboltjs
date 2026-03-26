/**
 * Linear Agent Plugin — CodeBolt Plugin
 *
 * Polls Linear for agent sessions (@mentions and delegated issues),
 * processes them via CodeBolt agents, and reports progress back
 * as Linear agent activities.
 *
 * Architecture:
 *   1. Plugin starts → loads config → starts polling Linear API
 *   2. Poller detects new agent sessions → handler processes them
 *   3. Handler emits activities back to Linear (thought, action, response)
 *   4. Settings UI allows configuring API key, poll interval, and viewing sessions
 */

import plugin from '@codebolt/plugin-sdk';
import { loadConfig, saveConfig, type LinearPluginConfig } from './config/store.js';
import { LinearAgentClient } from './linear/client.js';
import { SessionPoller } from './poller/sessionPoller.js';
import { SessionHandler } from './session/handler.js';

let poller: SessionPoller | null = null;
let handler: SessionHandler | null = null;
let client: LinearAgentClient | null = null;
let config: LinearPluginConfig;
let pluginDir: string;

function startPolling(): void {
    if (!config.apiKey) return;

    client = new LinearAgentClient(config.apiKey);
    handler = new SessionHandler(client);
    poller = new SessionPoller(client, config.pollIntervalMs);

    poller.on('session:new', (session) => {
        console.log(`[LinearAgent] New session: ${session.id} for ${session.issue?.identifier ?? session.issueId}`);
        handler!.handleNewSession(session).catch((err) => {
            console.error('[LinearAgent] Session handling failed:', err);
        });
    });

    poller.on('session:updated', (session) => {
        console.log(`[LinearAgent] Session updated: ${session.id}`);
    });

    poller.on('session:signal', (sessionId, signal) => {
        console.log(`[LinearAgent] Signal ${signal.type} for session ${sessionId}`);
        handler!.handleSignal(sessionId, signal.type);
    });

    poller.on('error', (err) => {
        console.error('[LinearAgent] Poll error:', err.message);
    });

    poller.start();
    console.log(`[LinearAgent] Polling started (interval: ${config.pollIntervalMs}ms)`);
}

function stopPolling(): void {
    if (poller) {
        poller.stop();
        poller = null;
    }
    if (handler) {
        handler.cancelAll();
        handler = null;
    }
    client = null;
}

async function restartPolling(): Promise<void> {
    stopPolling();
    if (config.apiKey && config.enabled) {
        startPolling();
    }
}

// ---------------------------------------------------------------------------
// Plugin lifecycle
// ---------------------------------------------------------------------------

plugin.onStart(async (ctx) => {
    console.log(`[LinearAgent] Started: ${ctx.pluginId}`);
    pluginDir = (ctx as any).pluginDir ?? process.env.PLUGIN_DIR ?? '.';

    const PANEL_ID = `plugin-ui-${ctx.pluginId}`;

    // Load persisted config
    config = await loadConfig(pluginDir);

    // Listen for messages from the settings UI panel
    plugin.dynamicPanel.onMessage(PANEL_ID, async (data: any) => {
        switch (data.type) {
            case 'get-config': {
                plugin.dynamicPanel.send(PANEL_ID, {
                    type: 'config',
                    config: {
                        ...config,
                        apiKey: config.apiKey ? '****' + config.apiKey.slice(-4) : '',
                    },
                    isConnected: !!poller,
                    activeSessions: handler?.activeSessionCount ?? 0,
                });
                break;
            }

            case 'save-config': {
                if (data.apiKey !== undefined && data.apiKey !== '') {
                    // Only update if a real key was provided (not the masked one)
                    if (!data.apiKey.startsWith('****')) {
                        config.apiKey = data.apiKey;
                    }
                }
                if (typeof data.pollIntervalMs === 'number' && data.pollIntervalMs >= 1000) {
                    config.pollIntervalMs = data.pollIntervalMs;
                }
                if (typeof data.enabled === 'boolean') {
                    config.enabled = data.enabled;
                }
                await saveConfig(pluginDir, config);
                await restartPolling();
                plugin.dynamicPanel.send(PANEL_ID, {
                    type: 'config-saved',
                    success: true,
                });
                break;
            }

            case 'test-connection': {
                if (!config.apiKey) {
                    plugin.dynamicPanel.send(PANEL_ID, {
                        type: 'test-result',
                        valid: false,
                        error: 'No API key configured',
                    });
                    return;
                }
                const testClient = new LinearAgentClient(config.apiKey);
                const result = await testClient.validateConnection();
                plugin.dynamicPanel.send(PANEL_ID, {
                    type: 'test-result',
                    ...result,
                });
                break;
            }

            case 'get-sessions': {
                if (client) {
                    try {
                        const sessions = await client.fetchActiveSessions();
                        plugin.dynamicPanel.send(PANEL_ID, {
                            type: 'sessions',
                            sessions: sessions.map((s) => ({
                                id: s.id,
                                state: s.state,
                                issueIdentifier: s.issue?.identifier,
                                issueTitle: s.issue?.title,
                                updatedAt: s.updatedAt,
                            })),
                        });
                    } catch {
                        plugin.dynamicPanel.send(PANEL_ID, {
                            type: 'sessions',
                            sessions: [],
                            error: 'Failed to fetch sessions',
                        });
                    }
                } else {
                    plugin.dynamicPanel.send(PANEL_ID, {
                        type: 'sessions',
                        sessions: [],
                        error: 'Not connected — configure API key first',
                    });
                }
                break;
            }
        }
    });

    // Start polling if configured
    if (config.apiKey && config.enabled) {
        startPolling();
    } else {
        console.log('[LinearAgent] No API key or disabled — waiting for configuration via UI');
    }
});

plugin.onStop(async () => {
    console.log('[LinearAgent] Stopping...');
    stopPolling();
    console.log('[LinearAgent] Stopped');
});
