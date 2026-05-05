/**
 * Slack Channel Plugin for CodeBolt
 *
 * Receives messages from Slack and routes them to agents via the gateway.
 * Uses Socket Mode (requires an App-Level Token and Bot Token).
 *
 * Credentials: { appToken: string, botToken: string }
 */

import plugin from "@codebolt/plugin-sdk";
import { App } from "@slack/bolt";

let app: App | null = null;
let botUserId: string | null = null;
let botToken: string | null = null;
let pluginConfig: { agentId?: string; threadStrategy?: string } = {};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function chunkText(text: string, maxLen: number): string[] {
    if (text.length <= maxLen) return [text];
    const chunks: string[] = [];
    let remaining = text;
    while (remaining.length > 0) {
        if (remaining.length <= maxLen) {
            chunks.push(remaining);
            break;
        }
        // Try to split at newline boundary
        let splitAt = remaining.lastIndexOf("\n", maxLen);
        if (splitAt <= 0) splitAt = maxLen;
        chunks.push(remaining.substring(0, splitAt));
        remaining = remaining.substring(splitAt).trimStart();
    }
    return chunks;
}

// ---------------------------------------------------------------------------
// Message handlers (ported from SlackAdapter)
// ---------------------------------------------------------------------------

function handleMessage(message: any): void {
    // Ignore bot messages and message changes
    if (message.subtype || message.bot_id) return;
    // Ignore own messages
    if (message.user === botUserId) return;

    const attachments = (message.files || []).map((f: any) => ({
        type: f.mimetype?.startsWith("image/") ? ("image" as const) : ("file" as const),
        url: f.url_private || f.permalink,
        name: f.name,
        size: f.size,
    }));

    plugin.gateway.routeMessage({
        externalMessageId: message.ts,
        externalUserId: message.user,
        senderName: message.user, // User ID — resolve via users.info if needed
        externalThreadId: message.channel,
        text: message.text || "",
        attachments,
        timestamp: new Date(parseFloat(message.ts) * 1000).toISOString(),
        rawPayload: {
            thread_ts: message.thread_ts,
            channel_type: message.channel_type,
        },
    });
}

function handleMention(event: any): void {
    // Ignore own mentions
    if (event.user === botUserId) return;

    plugin.gateway.routeMessage({
        externalMessageId: event.ts,
        externalUserId: event.user,
        senderName: event.user,
        externalThreadId: event.channel,
        text: event.text || "",
        attachments: [],
        timestamp: new Date(parseFloat(event.ts) * 1000).toISOString(),
        rawPayload: {
            thread_ts: event.thread_ts,
            eventType: "app_mention",
        },
    });
}

// ---------------------------------------------------------------------------
// Connect / Disconnect
// ---------------------------------------------------------------------------

async function connectBot(appTokenVal: string, botTokenVal: string): Promise<void> {
    // Disconnect existing connection if any
    if (app) {
        try {
            await app.stop();
        } catch (_e) {
            // ignore
        }
        app = null;
        botUserId = null;
    }

    // Validate tokens
    if (!appTokenVal || !botTokenVal) {
        throw new Error("Missing appToken or botToken credentials");
    }
    if (!appTokenVal.startsWith("xapp-")) {
        console.warn("[SlackPlugin] appToken should start with \"xapp-\" for Socket Mode");
    }
    if (!botTokenVal.startsWith("xoxb-")) {
        console.warn("[SlackPlugin] botToken should start with \"xoxb-\"");
    }

    botToken = botTokenVal;

    app = new App({
        token: botTokenVal,
        appToken: appTokenVal,
        socketMode: true,
        logLevel: "ERROR" as any,
    });

    // Get bot user ID via auth.test
    try {
        const authResult = await app.client.auth.test({
            token: botTokenVal,
        });
        botUserId = authResult.user_id as string;
        console.log(`[SlackPlugin] Authenticated as ${authResult.user} (${botUserId})`);
    } catch (err: any) {
        console.warn(`[SlackPlugin] auth.test failed: ${err.message}`);
    }

    // Register message handler
    app.message(async ({ message }: any) => {
        handleMessage(message);
    });

    // Register app_mention handler (for channel mentions)
    app.event("app_mention", async ({ event }: any) => {
        handleMention(event);
    });

    // Start the app (Socket Mode)
    await app.start();
    console.log("[SlackPlugin] Socket Mode connected");

    plugin.dynamicPanel.sendMessage({
        type: "status",
        status: "connected",
        botUsername: botUserId || "Unknown",
    });

    // Register as channel in Routing Rules
    try {
        await plugin.gateway.registerChannel({
            name: `Slack (${botUserId || 'Bot'})`,
            platform: 'slack',
            agentId: pluginConfig.agentId || '',
            threadStrategy: pluginConfig.threadStrategy as any || 'per-user',
        });
        console.log('[SlackPlugin] Registered as channel in Routing Rules');
    } catch (err: any) {
        console.warn(`[SlackPlugin] Channel registration failed: ${err.message}`);
    }
}

function disconnectBot(): void {
    if (app) {
        try {
            app.stop();
        } catch (_e) {
            // ignore
        }
        app = null;
        botUserId = null;
        botToken = null;
    }
    plugin.gateway.unregisterChannel().catch(() => {});
    plugin.dynamicPanel.sendMessage({ type: "status", status: "disconnected" });
}

// ---------------------------------------------------------------------------
// Plugin lifecycle
// ---------------------------------------------------------------------------

plugin.onStart(async (ctx: any) => {
    console.log("[SlackPlugin] Plugin started");

    // ----- Gateway reply handler -----
    plugin.gateway.onReply(async (reply: any) => {
        if (!app) {
            console.error("[SlackPlugin] Cannot send reply — app not connected");
            return;
        }

        const channel = reply.externalThreadId;
        if (!channel) {
            console.error("[SlackPlugin] Missing externalThreadId (channel) for reply");
            return;
        }

        try {
            // Slack message limit: 4000 characters
            if (reply.text) {
                const chunks = chunkText(reply.text, 4000);
                for (const chunk of chunks) {
                    await app.client.chat.postMessage({
                        token: botToken!,
                        channel,
                        text: chunk,
                        // Thread reply if we have a thread_ts
                        ...(reply.metadata?.thread_ts
                            ? { thread_ts: reply.metadata.thread_ts }
                            : {}),
                    });
                }
            }

            // Handle file attachments via uploadV2
            if (reply.attachments?.length) {
                for (const attachment of reply.attachments) {
                    await app.client.files.uploadV2({
                        token: botToken!,
                        channel_id: channel,
                        file: attachment.url,
                        filename: attachment.name || "attachment",
                        ...(reply.metadata?.thread_ts
                            ? { thread_ts: reply.metadata.thread_ts }
                            : {}),
                    });
                }
            }
        } catch (error: any) {
            console.error(`[SlackPlugin] Send failed: ${error.message}`);
        }
    });

    // ----- Proactive message handler -----
    plugin.gateway.onMessageToChannel(async (msg: any) => {
        if (!app || !botToken) {
            console.error("[SlackPlugin] Cannot send message — app not connected");
            return;
        }
        try {
            const chunks = chunkText(msg.text, 4000);
            for (const chunk of chunks) {
                await app.client.chat.postMessage({
                    token: botToken,
                    channel: msg.targetId,
                    text: chunk,
                });
            }
        } catch (error: any) {
            console.error(`[SlackPlugin] Proactive send failed: ${error.message}`);
        }
    });

    // ----- Dynamic panel (UI) message handler -----
    plugin.dynamicPanel.onMessage(async (message: any) => {
        const { type } = message;

        if (type === "connect") {
            const { appToken: appTokenVal, botToken: botTokenVal, agentId, threadStrategy } = message;
            pluginConfig = { agentId, threadStrategy };

            if (!appTokenVal || !botTokenVal) {
                plugin.dynamicPanel.sendMessage({
                    type: "error",
                    message: "App Token and Bot Token are both required",
                });
                return;
            }

            // Pass agent/thread config to the gateway
            plugin.gateway.configure({
                agentId: agentId || undefined,
                threadStrategy: threadStrategy || "per-user",
            });

            try {
                await connectBot(appTokenVal, botTokenVal);
            } catch (err: any) {
                plugin.dynamicPanel.sendMessage({
                    type: "error",
                    message: err.message || String(err),
                });
            }
        } else if (type === "disconnect") {
            disconnectBot();
        } else if (type === "credentials") {
            // UI requesting current status
            plugin.dynamicPanel.sendMessage({
                type: "status",
                status: app ? "connected" : "disconnected",
            });
        }
    });
});
