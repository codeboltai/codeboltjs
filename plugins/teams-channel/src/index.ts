/**
 * Microsoft Teams Channel Plugin for CodeBolt
 *
 * Receives messages from Teams via Bot Framework and routes them to agents
 * via the gateway. Hosts an Express server for webhook traffic.
 *
 * Credentials: { appId: string, appPassword: string, tenantId?: string }
 */

import plugin from "@codebolt/plugin-sdk";
import { BotFrameworkAdapter, TurnContext } from "botbuilder";
import express from "express";
import type { Server } from "http";

let adapter: BotFrameworkAdapter | null = null;
let server: Server | null = null;
const conversationRefs: Map<string, any> = new Map();
let pluginConfig: { agentId?: string; threadStrategy?: string } = {};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Remove the bot @mention from message text (Teams includes it by default).
 * Teams wraps mentions in <at>BotName</at>.
 */
function removeBotMention(text: string, botName?: string): string {
    if (!botName) return text;
    const mentionPattern = new RegExp(
        `<at>${escapeRegex(botName)}<\\/at>`,
        "gi"
    );
    return text.replace(mentionPattern, "").trim();
}

function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ---------------------------------------------------------------------------
// Turn handler (ported from TeamsAdapter)
// ---------------------------------------------------------------------------

async function handleTurn(context: any): Promise<void> {
    if (context.activity.type !== "message") {
        return; // Only handle message activities
    }

    // Store conversation reference for proactive messaging
    const ref = TurnContext.getConversationReference(context.activity);
    const conversationId: string = context.activity.conversation?.id || "";
    conversationRefs.set(conversationId, ref);

    // Extract sender info
    const from = context.activity.from;
    const text: string = context.activity.text || "";

    // Remove bot @mention from text
    const cleanText = removeBotMention(text, context.activity.recipient?.name);

    if (!cleanText.trim()) return; // Empty after mention removal

    // Build attachments — filter out Teams HTML cards
    const attachments = (context.activity.attachments || [])
        .filter((a: any) => a.contentType !== "text/html")
        .map((a: any) => ({
            type: a.contentType?.startsWith("image/")
                ? ("image" as const)
                : ("file" as const),
            url: a.contentUrl || "",
            name: a.name,
            mimeType: a.contentType,
        }));

    plugin.gateway.routeMessage({
        externalMessageId: context.activity.id,
        externalUserId: from?.aadObjectId || from?.id || "",
        senderName: from?.name || "Unknown",
        externalThreadId: conversationId,
        text: cleanText,
        attachments,
        timestamp: context.activity.timestamp
            ? new Date(context.activity.timestamp).toISOString()
            : new Date().toISOString(),
        rawPayload: {
            conversationType: context.activity.conversation?.conversationType,
            tenantId: context.activity.conversation?.tenantId,
            serviceUrl: context.activity.serviceUrl,
        },
    });
}

// ---------------------------------------------------------------------------
// Connect / Disconnect
// ---------------------------------------------------------------------------

async function connectBot(
    appId: string,
    appPassword: string,
    tenantId?: string,
    webhookPort: number = 3978,
    webhookPath: string = "/api/messages"
): Promise<void> {
    // Disconnect existing connection if any
    if (server) {
        await new Promise<void>((resolve) => {
            server!.close(() => resolve());
        });
        server = null;
    }
    adapter = null;
    conversationRefs.clear();

    // Validate credentials
    if (!appId || !appPassword) {
        throw new Error("Missing appId or appPassword credentials");
    }

    // Create Bot Framework adapter
    adapter = new BotFrameworkAdapter({
        appId,
        appPassword,
        channelAuthTenant: tenantId || undefined,
    });

    // Error handler
    adapter.onTurnError = async (context: any, error: any) => {
        console.error(`[TeamsPlugin] Turn error: ${error.message || error}`);
        try {
            await context.sendActivity("Sorry, an error occurred.");
        } catch (_e) {
            // swallow reply errors
        }
    };

    // Set up Express server
    const app = express();

    app.post(webhookPath, async (req: any, res: any) => {
        try {
            await adapter!.process(req, res, async (context: any) => {
                await handleTurn(context);
            });
        } catch (error: any) {
            console.error(
                `[TeamsPlugin] Request processing error: ${error.message}`
            );
            res.status(500).send();
        }
    });

    // Health endpoint
    app.get("/health", (_req: any, res: any) => {
        res.json({ status: "ok", adapter: "teams" });
    });

    // Start listening
    await new Promise<void>((resolve, reject) => {
        server = app.listen(webhookPort, () => {
            console.log(
                `[TeamsPlugin] Webhook listening on port ${webhookPort}${webhookPath}`
            );
            resolve();
        });
        server.on("error", (err: any) => {
            reject(err);
        });
    });

    plugin.dynamicPanel.sendMessage({
        type: "status",
        status: "connected",
        webhookUrl: `http://localhost:${webhookPort}${webhookPath}`,
    });

    // Register as channel in Routing Rules
    try {
        await plugin.gateway.registerChannel({
            name: 'Microsoft Teams',
            platform: 'teams',
            agentId: pluginConfig.agentId || '',
            threadStrategy: pluginConfig.threadStrategy as any || 'per-user',
        });
        console.log('[TeamsPlugin] Registered as channel in Routing Rules');
    } catch (err: any) {
        console.warn(`[TeamsPlugin] Channel registration failed: ${err.message}`);
    }
}

function disconnectBot(): void {
    if (server) {
        try {
            server.close();
        } catch (_e) {
            // ignore
        }
        server = null;
    }
    adapter = null;
    conversationRefs.clear();
    plugin.gateway.unregisterChannel().catch(() => {});
    plugin.dynamicPanel.sendMessage({ type: "status", status: "disconnected" });
}

// ---------------------------------------------------------------------------
// Plugin lifecycle
// ---------------------------------------------------------------------------

plugin.onStart(async (ctx: any) => {
    console.log("[TeamsPlugin] Plugin started");

    // ----- Gateway reply handler -----
    plugin.gateway.onReply(async (reply: any) => {
        if (!adapter) {
            console.error("[TeamsPlugin] Cannot send reply — adapter not connected");
            return;
        }

        const conversationId = reply.externalThreadId;
        if (!conversationId) {
            console.error(
                "[TeamsPlugin] Missing externalThreadId (conversationId) for reply"
            );
            return;
        }

        const ref = conversationRefs.get(conversationId);
        if (!ref) {
            console.error(
                `[TeamsPlugin] No conversation reference for ${conversationId}. The bot must receive a message first.`
            );
            return;
        }

        try {
            await adapter.continueConversation(ref, async (turnContext: any) => {
                // Send text reply
                if (reply.text) {
                    await turnContext.sendActivity(reply.text);
                }

                // Handle attachments
                if (reply.attachments?.length) {
                    for (const attachment of reply.attachments) {
                        await turnContext.sendActivity({
                            text: "",
                            attachments: [
                                {
                                    contentType:
                                        attachment.mimeType ||
                                        "application/octet-stream",
                                    contentUrl: attachment.url,
                                    name: attachment.name || "attachment",
                                },
                            ],
                        });
                    }
                }
            });
        } catch (error: any) {
            console.error(`[TeamsPlugin] Send failed: ${error.message}`);
        }
    });

    // ----- Proactive message handler -----
    plugin.gateway.onMessageToChannel(async (msg: any) => {
        if (!adapter) {
            console.error("[TeamsPlugin] Cannot send message — adapter not connected");
            return;
        }
        const ref = conversationRefs.get(msg.targetId);
        if (!ref) {
            console.error(`[TeamsPlugin] No conversation reference for ${msg.targetId}`);
            return;
        }
        try {
            await adapter.continueConversation(ref, async (turnContext: any) => {
                await turnContext.sendActivity(msg.text);
            });
        } catch (error: any) {
            console.error(`[TeamsPlugin] Proactive send failed: ${error.message}`);
        }
    });

    // ----- Dynamic panel (UI) message handler -----
    plugin.dynamicPanel.onMessage(async (message: any) => {
        const { type } = message;

        if (type === "connect") {
            const {
                appId,
                appPassword,
                tenantId,
                webhookPort,
                webhookPath,
                agentId,
                threadStrategy,
            } = message;

            pluginConfig = { agentId, threadStrategy };

            if (!appId || !appPassword) {
                plugin.dynamicPanel.sendMessage({
                    type: "error",
                    message: "App ID and App Password are both required",
                });
                return;
            }

            try {
                await connectBot(
                    appId,
                    appPassword,
                    tenantId || undefined,
                    parseInt(webhookPort, 10) || 3978,
                    webhookPath || "/api/messages"
                );
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
                status: adapter ? "connected" : "disconnected",
            });
        }
    });
});
