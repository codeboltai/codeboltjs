/**
 * Discord Channel Plugin for CodeBolt
 *
 * Receives messages from Discord and routes them to agents via the gateway.
 * Supports DM and guild message routing (mention-based filtering in guilds).
 *
 * Credentials: { botToken: string }
 */

import plugin from "@codebolt/plugin-sdk";
import { Client, GatewayIntentBits, Partials, Message, TextChannel } from "discord.js";

let client: Client | null = null;
const channelCache: Map<string, any> = new Map();
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
// Message handler (ported from DiscordAdapter)
// ---------------------------------------------------------------------------

function handleMessage(message: Message): void {
    // Ignore messages from bots (including self)
    if (message.author.bot) return;

    // Check for mention in guild channels — DMs always pass through
    const isGuild = !!message.guild;
    if (isGuild && client?.user) {
        const mentioned = message.mentions.has(client.user.id);
        if (!mentioned) return; // Guild message without mention — skip
    }

    // Cache the channel for replies
    channelCache.set(message.channel.id, message.channel);

    const attachments = message.attachments?.map((a) => ({
        type: a.contentType?.startsWith("image/") ? ("image" as const) : ("file" as const),
        url: a.url,
        name: a.name,
        size: a.size,
    })) || [];

    plugin.gateway.routeMessage({
        externalMessageId: message.id,
        externalUserId: message.author.id,
        senderName: message.member?.displayName || message.author.username,
        externalThreadId: message.channel.id,
        text: message.content,
        attachments,
        timestamp: message.createdAt.toISOString(),
        rawPayload: {
            guildId: message.guild?.id,
            channelName: (message.channel as TextChannel).name,
            isDM: !isGuild,
        },
    });
}

// ---------------------------------------------------------------------------
// Connect / Disconnect
// ---------------------------------------------------------------------------

async function connectBot(botToken: string): Promise<void> {
    if (client) {
        client.destroy();
        client = null;
        channelCache.clear();
    }

    client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.DirectMessages,
        ],
        partials: [
            Partials.Channel, // Required for DM support
            Partials.Message,
        ],
    });

    client.once("ready", async () => {
        const user = client!.user;
        console.log(`[DiscordPlugin] Connected as ${user?.tag} (${user?.id})`);
        plugin.dynamicPanel.sendMessage({
            type: "status",
            status: "connected",
            botUsername: user?.tag || "Unknown",
        });

        // Register as channel in Routing Rules
        try {
            await plugin.gateway.registerChannel({
                name: `Discord (${user?.tag || 'Bot'})`,
                platform: 'discord',
                agentId: pluginConfig.agentId || '',
                threadStrategy: pluginConfig.threadStrategy as any || 'per-user',
            });
            console.log('[DiscordPlugin] Registered as channel in Routing Rules');
        } catch (err: any) {
            console.warn(`[DiscordPlugin] Channel registration failed: ${err.message}`);
        }
    });

    client.on("messageCreate", (msg: Message) => handleMessage(msg));

    client.on("error", (error) => {
        console.error(`[DiscordPlugin] Client error: ${error.message}`);
    });

    client.on("shardReconnecting", () => {
        console.log("[DiscordPlugin] Reconnecting...");
        plugin.dynamicPanel.sendMessage({ type: "status", status: "reconnecting" });
    });

    client.on("shardResume", () => {
        console.log("[DiscordPlugin] Reconnected");
        plugin.dynamicPanel.sendMessage({ type: "status", status: "connected" });
    });

    client.on("shardDisconnect", () => {
        console.warn("[DiscordPlugin] Disconnected");
        plugin.dynamicPanel.sendMessage({ type: "status", status: "disconnected" });
    });

    await client.login(botToken);
}

function disconnectBot(): void {
    if (client) {
        try {
            client.destroy();
        } catch (_e) {
            // ignore
        }
        client = null;
        channelCache.clear();
    }
    plugin.gateway.unregisterChannel().catch(() => {});
    plugin.dynamicPanel.sendMessage({ type: "status", status: "disconnected" });
}

// ---------------------------------------------------------------------------
// Plugin lifecycle
// ---------------------------------------------------------------------------

plugin.onStart(async (ctx: any) => {
    console.log("[DiscordPlugin] Plugin started");

    // ----- Gateway reply handler -----
    plugin.gateway.onReply(async (reply: any) => {
        if (!client) {
            console.error("[DiscordPlugin] Cannot send reply — client not connected");
            return;
        }

        const channelId = reply.externalThreadId;
        if (!channelId) {
            console.error("[DiscordPlugin] Missing externalThreadId for reply");
            return;
        }

        try {
            let channel = channelCache.get(channelId);
            if (!channel) {
                channel = await client.channels.fetch(channelId);
                if (channel) {
                    channelCache.set(channelId, channel);
                }
            }

            if (!channel || !channel.send) {
                console.error(`[DiscordPlugin] Cannot send to channel ${channelId}`);
                return;
            }

            // Discord message limit: 2000 characters
            if (reply.text) {
                const chunks = chunkText(reply.text, 2000);
                for (const chunk of chunks) {
                    await channel.send(chunk);
                }
            }

            // Handle file attachments
            if (reply.attachments?.length) {
                const files = reply.attachments.map((a: any) => ({
                    attachment: a.url,
                    name: a.name || "attachment",
                }));
                await channel.send({ files });
            }
        } catch (error: any) {
            console.error(`[DiscordPlugin] Send failed: ${error.message}`);
        }
    });

    // ----- Proactive message handler -----
    plugin.gateway.onMessageToChannel(async (msg: any) => {
        if (!client) {
            console.error("[DiscordPlugin] Cannot send message — client not connected");
            return;
        }
        try {
            let channel = channelCache.get(msg.targetId);
            if (!channel) {
                channel = await client.channels.fetch(msg.targetId);
                if (channel) channelCache.set(msg.targetId, channel);
            }
            if (channel?.send) {
                const chunks = chunkText(msg.text, 2000);
                for (const chunk of chunks) {
                    await channel.send(chunk);
                }
            }
        } catch (error: any) {
            console.error(`[DiscordPlugin] Proactive send failed: ${error.message}`);
        }
    });

    // ----- Dynamic panel (UI) message handler -----
    plugin.dynamicPanel.onMessage(async (message: any) => {
        const { type } = message;

        if (type === "connect") {
            const { botToken, agentId, threadStrategy } = message;
            pluginConfig = { agentId, threadStrategy };
            if (!botToken) {
                plugin.dynamicPanel.sendMessage({
                    type: "error",
                    message: "Bot Token is required",
                });
                return;
            }

            // Pass agent/thread config to the gateway
            plugin.gateway.configure({
                agentId: agentId || undefined,
                threadStrategy: threadStrategy || "per-user",
            });

            try {
                await connectBot(botToken);
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
                status: client ? "connected" : "disconnected",
            });
        }
    });
});
