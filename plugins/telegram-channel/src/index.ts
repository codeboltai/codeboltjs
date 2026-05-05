import plugin from '@codebolt/plugin-sdk';
import { Bot } from 'grammy';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

let bot: Bot | null = null;
let botInfo: any = null;
let config: {
    credentials: { botToken: string };
    agentId: string;
    threadStrategy: 'single' | 'per-user' | 'per-conversation' | 'per-message' | 'existing';
} | null = null;

const PANEL_ID = 'plugin-ui-telegram-channel';
const KV_INSTANCE_ID = 'telegram-channel-plugin';
const KV_NAMESPACE = 'config';
const KV_KEY = 'connection';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sendStatus(status: 'connected' | 'disconnected' | 'error', message?: string) {
    plugin.dynamicPanel.send(PANEL_ID, {
        type: 'status',
        status,
        message,
        ...(status === 'connected' && config ? { config } : {}),
    });
}

async function savePluginConfig(cfg: typeof config) {
    try {
        await plugin.kvStore.set(KV_INSTANCE_ID, KV_NAMESPACE, KV_KEY, cfg, true);
        console.log('[TelegramPlugin] Configuration saved');
    } catch (err: any) {
        console.error(`[TelegramPlugin] Failed to save configuration: ${err.message}`);
    }
}

async function loadPluginConfig(): Promise<typeof config> {
    try {
        const result = await plugin.kvStore.get(KV_INSTANCE_ID, KV_NAMESPACE, KV_KEY);
        if (result?.data?.value) {
            console.log('[TelegramPlugin] Configuration loaded from store');
            return result.data.value;
        }
    } catch (err: any) {
        console.error(`[TelegramPlugin] Failed to load configuration: ${err.message}`);
    }
    return null;
}

// ---------------------------------------------------------------------------
// Connect / Disconnect
// ---------------------------------------------------------------------------

async function registerAsChannel() {
    if (!config) return;
    try {
        await plugin.gateway.registerChannel({
            name: `Telegram (${botInfo?.username || 'Bot'})`,
            platform: 'telegram',
            agentId: config.agentId,
            threadStrategy: config.threadStrategy || 'per-conversation',
        });
        console.log('[TelegramPlugin] Registered as channel in Routing Rules');
    } catch (err: any) {
        console.warn(`[TelegramPlugin] Channel registration failed: ${err.message}`);
    }
}

async function connect(cfg: typeof config) {
    if (bot) {
        await disconnect();
    }

    config = cfg;

    if (!config?.credentials?.botToken) {
        sendStatus('error', 'Missing botToken credential');
        return;
    }

    try {
        bot = new Bot(config.credentials.botToken);

        // Get bot info to verify the token and identify ourselves
        botInfo = await bot.api.getMe();
        console.log(`[TelegramPlugin] Bot connected: @${botInfo.username} (${botInfo.first_name})`);

        // ----- Message handlers -----

        bot.on('message:text', (ctx) => handleTextMessage(ctx));
        bot.on('message:photo', (ctx) => handleMediaMessage(ctx, 'image'));
        bot.on('message:document', (ctx) => handleMediaMessage(ctx, 'file'));
        bot.on('message:voice', (ctx) => handleMediaMessage(ctx, 'file'));
        bot.on('message:video', (ctx) => handleMediaMessage(ctx, 'file'));

        // ----- Error handling -----

        bot.catch((err: any) => {
            console.error(`[TelegramPlugin] Bot error: ${err.message || err}`);
            // Don't disconnect on transient errors
        });

        // Start long-polling
        bot.start({
            onStart: () => {
                console.log('[TelegramPlugin] Long-polling started');
            },
            drop_pending_updates: true,
        });

        sendStatus('connected');

        // Register as channel so it appears in Routing Rules
        await registerAsChannel();

        // Save configuration after successful connection
        await savePluginConfig(config);
    } catch (error: any) {
        const msg = error.message || String(error);
        console.error(`[TelegramPlugin] Connection error: ${msg}`);
        bot = null;
        botInfo = null;
        sendStatus('error', msg);
    }
}

async function disconnect() {
    if (bot) {
        try {
            await bot.stop();
        } catch (_e) {
            // ignore stop errors
        }
        bot = null;
        botInfo = null;
    }
    config = null;
    plugin.gateway.unregisterChannel().catch(() => {});
    sendStatus('disconnected');
}

// ---------------------------------------------------------------------------
// Incoming message handlers (Telegram -> Gateway)
// ---------------------------------------------------------------------------

function handleTextMessage(ctx: any): void {
    // Ignore messages from the bot itself
    if (ctx.from?.id === botInfo?.id) return;

    const chat = ctx.chat;
    const isGroup = chat.type === 'group' || chat.type === 'supergroup';

    // In groups, only respond when the bot is mentioned
    if (isGroup && botInfo) {
        const text = ctx.message.text || '';
        const botMention = `@${botInfo.username}`;
        if (!text.includes(botMention)) {
            return;
        }
    }

    const incoming = {
        externalMessageId: String(ctx.message.message_id),
        externalUserId: String(ctx.from.id),
        senderName: [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(' '),
        externalThreadId: String(chat.id),
        text: ctx.message.text || '',
        timestamp: new Date(ctx.message.date * 1000).toISOString(),
        rawPayload: ctx.message,
    };

    plugin.gateway.routeMessage({
        source: 'channel',
        sourceId: 'plugin-telegram-channel',
        threadStrategy: config?.threadStrategy || 'per-conversation',
        agentId: config?.agentId,
        text: incoming.text,
        userId: incoming.externalUserId,
        externalThreadId: incoming.externalThreadId,
        replyTo: {
            channelId: 'telegram',
            externalThreadId: incoming.externalThreadId,
            userId: incoming.externalUserId,
        },
        metadata: {
            externalMessageId: incoming.externalMessageId,
            senderName: incoming.senderName,
            rawPayload: incoming.rawPayload,
        },
        timestamp: incoming.timestamp,
    }).then(result => {
        console.log(`[TelegramPlugin] Message routed: ${result?.data?.action || 'unknown'}`);
    }).catch(err => {
        console.error(`[TelegramPlugin] Failed to route message: ${err.message}`);
    });
}

function handleMediaMessage(ctx: any, type: 'image' | 'file'): void {
    if (ctx.from?.id === botInfo?.id) return;

    const chat = ctx.chat;
    const caption = ctx.message.caption || '';

    const externalMessageId = String(ctx.message.message_id);
    const externalUserId = String(ctx.from.id);
    const senderName = [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(' ');
    const externalThreadId = String(chat.id);
    const text = caption || `[${type} attachment]`;
    const timestamp = new Date(ctx.message.date * 1000).toISOString();

    plugin.gateway.routeMessage({
        source: 'channel',
        sourceId: 'plugin-telegram-channel',
        threadStrategy: config?.threadStrategy || 'per-conversation',
        agentId: config?.agentId,
        text,
        userId: externalUserId,
        externalThreadId,
        replyTo: {
            channelId: 'telegram',
            externalThreadId,
            userId: externalUserId,
        },
        metadata: {
            externalMessageId,
            senderName,
            attachments: [{
                type,
                url: '',  // Telegram doesn't provide direct URLs; would need getFile()
                name: (ctx.message.document || ctx.message.video)?.file_name,
                size: (ctx.message.document || ctx.message.video || ctx.message.photo?.[0])?.file_size,
            }],
            rawPayload: ctx.message,
        },
        timestamp,
    }).then(result => {
        console.log(`[TelegramPlugin] Media message routed: ${result?.data?.action || 'unknown'}`);
    }).catch(err => {
        console.error(`[TelegramPlugin] Failed to route media message: ${err.message}`);
    });
}

// ---------------------------------------------------------------------------
// Outgoing reply handler (Gateway -> Telegram)
// ---------------------------------------------------------------------------

plugin.gateway.onReply(async (reply: any) => {
    if (!bot) {
        console.warn('[TelegramPlugin] Received reply but bot is not connected');
        return;
    }

    const chatId = reply.externalThreadId;
    if (!chatId) {
        console.error('[TelegramPlugin] externalThreadId (chatId) is required to send a reply');
        return;
    }

    try {
        // Send text with HTML parse mode
        await bot.api.sendMessage(chatId, reply.text, {
            parse_mode: 'HTML',
        });

        // Handle attachments
        if (reply.attachments?.length) {
            for (const attachment of reply.attachments) {
                switch (attachment.type) {
                    case 'image':
                        await bot.api.sendPhoto(chatId, attachment.url);
                        break;
                    case 'file':
                        await bot.api.sendDocument(chatId, attachment.url);
                        break;
                    default:
                        await bot.api.sendMessage(chatId, attachment.url);
                }
            }
        }
    } catch (error: any) {
        // If HTML parsing fails, retry as plain text
        if (error.description?.includes('parse')) {
            console.warn('[TelegramPlugin] HTML parse failed, retrying as plain text');
            await bot.api.sendMessage(chatId, reply.text);
        } else {
            console.error(`[TelegramPlugin] Failed to send reply: ${error.message}`);
        }
    }
});

// ---------------------------------------------------------------------------
// Proactive message handler (Application -> Telegram)
// ---------------------------------------------------------------------------

plugin.gateway.onMessageToChannel(async (msg: any) => {
    if (!bot) {
        console.warn('[TelegramPlugin] Received proactive message but bot is not connected');
        return;
    }

    try {
        await bot.api.sendMessage(msg.targetId, msg.text, { parse_mode: 'HTML' });
    } catch (error: any) {
        if (error.description?.includes('parse')) {
            await bot.api.sendMessage(msg.targetId, msg.text);
        } else {
            console.error(`[TelegramPlugin] Failed to send proactive message: ${error.message}`);
        }
    }
});

// ---------------------------------------------------------------------------
// UI panel communication
// ---------------------------------------------------------------------------

plugin.dynamicPanel.onMessage(PANEL_ID, async (message: any) => {
    switch (message.type) {
        case 'connect':
            await connect(message.config);
            break;
        case 'disconnect':
            await disconnect();
            break;
        case 'getStatus':
            sendStatus(bot ? 'connected' : 'disconnected');
            break;
        default:
            console.warn(`[TelegramPlugin] Unknown UI message type: ${message.type}`);
    }
});

// ---------------------------------------------------------------------------
// Plugin lifecycle
// ---------------------------------------------------------------------------

plugin.onStart(async (_ctx: any) => {
    console.log('[TelegramPlugin] Plugin started');

    // Try to auto-connect from saved configuration
    const savedConfig = await loadPluginConfig();
    if (savedConfig) {
        console.log('[TelegramPlugin] Found saved configuration, auto-connecting...');
        await connect(savedConfig);
    } else {
        sendStatus('disconnected');
    }
});

plugin.onStop(async () => {
    console.log('[TelegramPlugin] Plugin stopping');
    await disconnect();
});
