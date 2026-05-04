import plugin from '@codebolt/plugin-sdk';
import * as path from 'path';
import * as fs from 'fs';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

let sock: any = null;
let saveCreds: (() => Promise<void>) | null = null;
let pluginDir: string = '';
let config: {
    credentials: { authDir: string };
    agentId: string;
    threadStrategy: string;
} | null = null;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sendStatus(status: 'connected' | 'disconnected' | 'connecting' | 'error', message?: string) {
    plugin.dynamicPanel.sendMessage({ type: 'status', status, message });
}

function sendQR(qr: string) {
    plugin.dynamicPanel.sendMessage({ type: 'qr', qr });
}

// ---------------------------------------------------------------------------
// Connect / Disconnect
// ---------------------------------------------------------------------------

async function connect(cfg: typeof config) {
    if (sock) {
        await disconnect();
    }

    config = cfg;

    const authDir = config?.credentials?.authDir || path.join(pluginDir, '.whatsapp-auth');

    if (!authDir) {
        sendStatus('error', 'Missing authDir credential');
        return;
    }

    sendStatus('connecting');

    try {
        const baileys = await import('@whiskeysockets/baileys');
        const {
            default: makeWASocket,
            useMultiFileAuthState,
            DisconnectReason,
            fetchLatestBaileysVersion,
        } = baileys;

        // Ensure auth directory exists
        if (!fs.existsSync(authDir)) {
            fs.mkdirSync(authDir, { recursive: true });
        }

        // Load auth state
        const { state, saveCreds: _saveCreds } = await useMultiFileAuthState(authDir);
        saveCreds = _saveCreds;

        // Get latest Baileys version
        const { version } = await fetchLatestBaileysVersion();

        // Create socket
        sock = makeWASocket({
            version,
            auth: state,
            printQRInTerminal: false,
            // Quiet down internal logging
            logger: {
                info: () => {},
                error: (msg: string) => console.error(`[WhatsApp/Baileys] ${msg}`),
                warn: (msg: string) => console.warn(`[WhatsApp/Baileys] ${msg}`),
                debug: () => {},
                trace: () => {},
                child: () => ({
                    info: () => {}, error: () => {}, warn: () => {},
                    debug: () => {}, trace: () => {}, child: () => ({}),
                }),
            } as any,
        });

        // Save credentials on update
        sock.ev.on('creds.update', saveCreds);

        // Connection updates
        sock.ev.on('connection.update', (update: any) => {
            handleConnectionUpdate(update, DisconnectReason);
        });

        // Incoming messages
        sock.ev.on('messages.upsert', (upsert: any) => {
            handleMessagesUpsert(upsert);
        });

        console.log('[WhatsAppPlugin] Socket created, waiting for connection...');
    } catch (error: any) {
        const msg = error.message || String(error);
        if (msg.includes("Cannot find module '@whiskeysockets/baileys'")) {
            sendStatus('error', '@whiskeysockets/baileys package not installed. Run: npm install @whiskeysockets/baileys');
            return;
        }
        console.error(`[WhatsAppPlugin] Connection error: ${msg}`);
        sock = null;
        saveCreds = null;
        sendStatus('error', msg);
    }
}

async function disconnect() {
    if (sock) {
        try {
            sock.ev.removeAllListeners('messages.upsert');
            sock.ev.removeAllListeners('connection.update');
            sock.ev.removeAllListeners('creds.update');
            await sock.logout();
        } catch (_e) {
            // ignore logout errors
        }
        try {
            sock.end();
        } catch (_e) {
            // ignore
        }
        sock = null;
        saveCreds = null;
    }
    config = null;
    plugin.gateway.unregisterChannel().catch(() => {});
    sendStatus('disconnected');
}

// ---------------------------------------------------------------------------
// Connection update handler
// ---------------------------------------------------------------------------

function handleConnectionUpdate(update: any, DisconnectReason: any): void {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
        console.log('[WhatsAppPlugin] QR code generated — scan with WhatsApp to pair');
        // Send QR code to the UI panel for display
        sendQR(qr);
        sendStatus('connecting', 'QR code generated — scan with WhatsApp');
    }

    if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

        if (shouldReconnect) {
            console.log(`[WhatsAppPlugin] Connection closed (code ${statusCode}), reconnecting...`);
            sendStatus('connecting', `Reconnecting (code ${statusCode})...`);
            // Reconnect with delay
            setTimeout(() => {
                connect(config).catch((err: any) => {
                    console.error(`[WhatsAppPlugin] Reconnect failed: ${err.message}`);
                    sendStatus('error', err.message);
                });
            }, 3000);
        } else {
            console.log('[WhatsAppPlugin] Logged out');
            sock = null;
            saveCreds = null;
            sendStatus('disconnected', 'Logged out');
        }
    }

    if (connection === 'open') {
        console.log('[WhatsAppPlugin] Connected to WhatsApp');
        sendStatus('connected');

        // Register as channel in Routing Rules
        try {
            plugin.gateway.registerChannel({
                name: 'WhatsApp',
                platform: 'whatsapp',
                agentId: config?.agentId || '',
                threadStrategy: (config?.threadStrategy as any) || 'per-conversation',
            });
            console.log('[WhatsAppPlugin] Registered as channel in Routing Rules');
        } catch (err: any) {
            console.warn(`[WhatsAppPlugin] Channel registration failed: ${err.message}`);
        }
    }
}

// ---------------------------------------------------------------------------
// Incoming message handler (WhatsApp -> Gateway)
// ---------------------------------------------------------------------------

function handleMessagesUpsert(upsert: any): void {
    const messages = upsert.messages || [];
    const type = upsert.type; // 'notify' for new messages

    if (type !== 'notify') return;

    for (const msg of messages) {
        // Ignore status broadcasts and own messages
        if (msg.key.remoteJid === 'status@broadcast') continue;
        if (msg.key.fromMe) continue;

        const jid = msg.key.remoteJid || '';
        const isGroup = jid.endsWith('@g.us');

        // Extract text from various message types
        const text = msg.message?.conversation
            || msg.message?.extendedTextMessage?.text
            || msg.message?.imageMessage?.caption
            || msg.message?.videoMessage?.caption
            || msg.message?.documentMessage?.caption
            || '';

        if (!text && !msg.message?.imageMessage && !msg.message?.documentMessage) {
            continue; // No processable content
        }

        // Determine sender
        const participant = isGroup ? msg.key.participant : jid;
        const pushName = msg.pushName || participant || 'Unknown';

        const incoming = {
            externalMessageId: msg.key.id || '',
            externalUserId: participant || jid,
            senderName: pushName,
            externalThreadId: jid,
            text: text || '[media]',
            attachments: extractAttachments(msg.message),
            timestamp: msg.messageTimestamp
                ? new Date(Number(msg.messageTimestamp) * 1000).toISOString()
                : new Date().toISOString(),
            rawPayload: {
                isGroup,
                participant,
                quotedMessage: msg.message?.extendedTextMessage?.contextInfo?.quotedMessage,
            },
        };

        plugin.gateway.routeMessage({
            message: incoming,
            agentId: config?.agentId,
            threadStrategy: config?.threadStrategy,
        });
    }
}

// ---------------------------------------------------------------------------
// Attachment extraction
// ---------------------------------------------------------------------------

function extractAttachments(message: any): any[] {
    if (!message) return [];
    const attachments: any[] = [];

    if (message.imageMessage) {
        attachments.push({
            type: 'image',
            url: '', // Baileys requires download via downloadMediaMessage()
            name: 'image',
            mimeType: message.imageMessage.mimetype,
            size: message.imageMessage.fileLength,
        });
    }
    if (message.documentMessage) {
        attachments.push({
            type: 'file',
            url: '',
            name: message.documentMessage.fileName || 'document',
            mimeType: message.documentMessage.mimetype,
            size: message.documentMessage.fileLength,
        });
    }
    if (message.audioMessage) {
        attachments.push({
            type: 'file',
            url: '',
            name: 'audio',
            mimeType: message.audioMessage.mimetype,
            size: message.audioMessage.fileLength,
        });
    }
    if (message.videoMessage) {
        attachments.push({
            type: 'file',
            url: '',
            name: 'video',
            mimeType: message.videoMessage.mimetype,
            size: message.videoMessage.fileLength,
        });
    }

    return attachments;
}

// ---------------------------------------------------------------------------
// Outgoing reply handler (Gateway -> WhatsApp)
// ---------------------------------------------------------------------------

plugin.gateway.onReply(async (reply: any) => {
    if (!sock) {
        console.warn('[WhatsAppPlugin] Received reply but socket is not connected');
        return;
    }

    const jid = reply.externalThreadId;
    if (!jid) {
        console.error('[WhatsAppPlugin] externalThreadId (JID) is required to send a WhatsApp reply');
        return;
    }

    try {
        // Send text
        await sock.sendMessage(jid, { text: reply.text });

        // Handle attachments
        if (reply.attachments?.length) {
            for (const attachment of reply.attachments) {
                switch (attachment.type) {
                    case 'image':
                        await sock.sendMessage(jid, {
                            image: { url: attachment.url },
                            caption: attachment.name,
                        });
                        break;
                    case 'file':
                        await sock.sendMessage(jid, {
                            document: { url: attachment.url },
                            fileName: attachment.name || 'file',
                            mimetype: attachment.mimeType || 'application/octet-stream',
                        });
                        break;
                    default:
                        await sock.sendMessage(jid, { text: attachment.url });
                }
            }
        }
    } catch (error: any) {
        console.error(`[WhatsAppPlugin] Failed to send reply: ${error.message}`);
    }
});

// ---------------------------------------------------------------------------
// Proactive message handler (Application -> WhatsApp)
// ---------------------------------------------------------------------------

plugin.gateway.onMessageToChannel(async (msg: any) => {
    if (!sock) {
        console.warn('[WhatsAppPlugin] Received proactive message but socket is not connected');
        return;
    }
    try {
        await sock.sendMessage(msg.targetId, { text: msg.text });
    } catch (error: any) {
        console.error(`[WhatsAppPlugin] Failed to send proactive message: ${error.message}`);
    }
});

// ---------------------------------------------------------------------------
// UI panel communication
// ---------------------------------------------------------------------------

plugin.dynamicPanel.onMessage(async (message: any) => {
    switch (message.type) {
        case 'connect':
            await connect(message.config);
            break;
        case 'disconnect':
            await disconnect();
            break;
        default:
            console.warn(`[WhatsAppPlugin] Unknown UI message type: ${message.type}`);
    }
});

// ---------------------------------------------------------------------------
// Plugin lifecycle
// ---------------------------------------------------------------------------

plugin.onStart(async (ctx: any) => {
    console.log('[WhatsAppPlugin] Plugin started');
    pluginDir = ctx.pluginDir || '';
    sendStatus('disconnected');
});

plugin.onStop(async () => {
    console.log('[WhatsAppPlugin] Plugin stopping');
    await disconnect();
});
