/**
 * Anthropic "Sign in with Claude Pro/Max" OAuth flow.
 *
 * Ported from pi-mono packages/ai/src/utils/oauth/anthropic.ts.
 * UNOFFICIAL endpoints — may drift; keep in sync with pi-mono upstream.
 *
 * Quirks vs a standard PKCE flow:
 *   - The OAuth `state` parameter equals the PKCE `verifier` (not a separate
 *     random value). pi-mono does this; we match it so the callback server's
 *     state check passes.
 *   - Anthropic mints its own `state` on the redirect, so we verify the
 *     returned state == verifier on the way back.
 *   - Access-token expiry is stored 5 minutes early for safety.
 */

import { spawn } from 'node:child_process';
import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import * as http from 'node:http';
import * as os from 'node:os';
import * as path from 'node:path';

// =============================================================================
// Constants — pi-mono oauth/anthropic.ts
// =============================================================================
const decode = (s: string) => Buffer.from(s, 'base64').toString('utf-8');
export const CLIENT_ID = decode('OWQxYzI1MGEtZTYxYi00NGQ5LTg4ZWQtNTk0NGQxOTYyZjVl');
export const AUTHORIZE_URL = 'https://claude.ai/oauth/authorize';
export const TOKEN_URL = 'https://platform.claude.com/v1/oauth/token';
export const CALLBACK_HOST = '127.0.0.1';
export const CALLBACK_PORT = 53692;
export const CALLBACK_PATH = '/callback';
export const REDIRECT_URI = `http://localhost:${CALLBACK_PORT}${CALLBACK_PATH}`;
export const SCOPES =
    'org:create_api_key user:profile user:inference user:sessions:claude_code user:mcp_servers user:file_upload';

// =============================================================================
// Token storage
// =============================================================================

export interface OAuthCredentials {
    access_token: string;
    refresh_token: string;
    /** Unix ms — already has a 5-minute safety buffer applied */
    expires_at: number;
}

function authFilePath(): string {
    const dir = path.join(os.homedir(), '.codebolt', 'plugins', 'anthropic-plugin');
    fs.mkdirSync(dir, { recursive: true });
    return path.join(dir, 'auth.json');
}

export function loadCredentials(): OAuthCredentials | null {
    try {
        const raw = fs.readFileSync(authFilePath(), 'utf-8');
        const parsed = JSON.parse(raw);
        if (!parsed?.access_token || !parsed?.refresh_token) return null;
        return parsed as OAuthCredentials;
    } catch {
        return null;
    }
}

export function saveCredentials(creds: OAuthCredentials): void {
    fs.writeFileSync(authFilePath(), JSON.stringify(creds, null, 2), { mode: 0o600 });
}

export function clearCredentials(): void {
    try {
        fs.unlinkSync(authFilePath());
    } catch {
        /* ignore */
    }
}

// =============================================================================
// PKCE
// =============================================================================

function base64url(buf: Buffer): string {
    return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function generatePKCE(): { verifier: string; challenge: string } {
    const verifier = base64url(crypto.randomBytes(32));
    const challenge = base64url(crypto.createHash('sha256').update(verifier).digest());
    return { verifier, challenge };
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderAuthPage(options: {
    title: string;
    message: string;
    tone: 'success' | 'error';
    detail?: string;
}): string {
    const { title, message, tone, detail } = options;
    const accent = tone === 'success' ? '#167c5a' : '#b9382f';
    const badgeBg = tone === 'success' ? 'rgba(22, 124, 90, 0.12)' : 'rgba(185, 56, 47, 0.12)';
    const badgeLabel = tone === 'success' ? 'Connected' : 'Action needed';
    const icon = tone === 'success' ? '✓' : '!';

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f4efe7;
      --panel: rgba(255, 255, 255, 0.9);
      --text: #1d1b19;
      --muted: #5f5a53;
      --border: rgba(29, 27, 25, 0.08);
      --shadow: 0 24px 80px rgba(35, 28, 20, 0.14);
      --accent: ${accent};
      --badge-bg: ${badgeBg};
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px;
      font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: var(--text);
      background:
        radial-gradient(circle at top left, rgba(221, 199, 165, 0.55), transparent 32%),
        radial-gradient(circle at bottom right, rgba(165, 197, 221, 0.45), transparent 28%),
        linear-gradient(180deg, #fbf8f2 0%, var(--bg) 100%);
    }

    .card {
      width: min(100%, 560px);
      padding: 32px;
      border: 1px solid var(--border);
      border-radius: 28px;
      background: var(--panel);
      box-shadow: var(--shadow);
      backdrop-filter: blur(18px);
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 8px 14px;
      border-radius: 999px;
      background: var(--badge-bg);
      color: var(--accent);
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.02em;
    }

    .icon {
      width: 22px;
      height: 22px;
      display: inline-grid;
      place-items: center;
      border-radius: 999px;
      background: var(--accent);
      color: #fff;
      font-size: 13px;
      line-height: 1;
    }

    h1 {
      margin: 20px 0 12px;
      font-size: clamp(30px, 4vw, 40px);
      line-height: 1.05;
      letter-spacing: -0.03em;
    }

    p {
      margin: 0;
      font-size: 16px;
      line-height: 1.65;
      color: var(--muted);
    }

    .detail {
      margin-top: 20px;
      padding: 14px 16px;
      border-radius: 16px;
      background: rgba(29, 27, 25, 0.04);
      color: var(--text);
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 13px;
      line-height: 1.5;
      overflow-wrap: anywhere;
    }

    .footer {
      margin-top: 28px;
      padding-top: 18px;
      border-top: 1px solid var(--border);
      font-size: 13px;
      color: var(--muted);
    }
  </style>
</head>
<body>
  <main class="card">
    <div class="badge"><span class="icon">${icon}</span>${badgeLabel}</div>
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(message)}</p>
    ${detail ? `<div class="detail">${escapeHtml(detail)}</div>` : ''}
    <div class="footer">You can close this tab and return to CodeBolt.</div>
  </main>
</body>
</html>`;
}

// =============================================================================
// Local callback server
// =============================================================================

function waitForCallback(expectedState: string, timeoutMs: number): Promise<string> {
    return new Promise((resolve, reject) => {
        const server = http.createServer((req, res) => {
            const url = new URL(req.url || '', `http://localhost:${CALLBACK_PORT}`);
            if (url.pathname !== CALLBACK_PATH) {
                res.writeHead(404).end('Not found');
                return;
            }
            const error = url.searchParams.get('error');
            if (error) {
                res.writeHead(400, { 'Content-Type': 'text/html' }).end(
                    renderAuthPage({
                        title: 'Sign-in was not completed',
                        message: 'The browser callback reached CodeBolt, but Claude returned an authentication error.',
                        tone: 'error',
                        detail: error,
                    })
                );
                cleanup();
                reject(new Error(`OAuth error: ${error}`));
                return;
            }
            const code = url.searchParams.get('code');
            const state = url.searchParams.get('state');
            if (!code || !state) {
                res.writeHead(400).end('Missing code/state');
                return;
            }
            if (state !== expectedState) {
                res.writeHead(400, { 'Content-Type': 'text/html' }).end(
                    renderAuthPage({
                        title: 'Security check failed',
                        message: 'The returned login state did not match the original request. Please start the sign-in flow again.',
                        tone: 'error',
                    })
                );
                cleanup();
                reject(new Error('OAuth state mismatch'));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' }).end(
                renderAuthPage({
                    title: 'Signed in to Claude',
                    message: 'Your CodeBolt session is now connected. Return to the app to continue using CodeBolt.',
                    tone: 'success',
                })
            );
            cleanup();
            resolve(code);
        });

        const timer = setTimeout(() => {
            cleanup();
            reject(new Error(`OAuth callback timed out after ${timeoutMs}ms`));
        }, timeoutMs);

        const cleanup = () => {
            clearTimeout(timer);
            try {
                server.close();
            } catch {
                /* ignore */
            }
        };

        server.on('error', (err) => {
            cleanup();
            reject(err);
        });
        server.listen(CALLBACK_PORT, CALLBACK_HOST);
    });
}

// =============================================================================
// Token exchange / refresh
// =============================================================================

async function exchangeCode(
    code: string,
    state: string,
    verifier: string
): Promise<OAuthCredentials> {
    const res = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
            grant_type: 'authorization_code',
            client_id: CLIENT_ID,
            code,
            state,
            redirect_uri: REDIRECT_URI,
            code_verifier: verifier,
        }),
    });
    if (!res.ok) {
        throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
    }
    const data: any = await res.json();
    return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: Date.now() + data.expires_in * 1000 - 5 * 60 * 1000,
    };
}

export async function refreshAccessToken(
    creds: OAuthCredentials
): Promise<OAuthCredentials> {
    const res = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
            grant_type: 'refresh_token',
            client_id: CLIENT_ID,
            refresh_token: creds.refresh_token,
        }),
    });
    if (!res.ok) {
        throw new Error(`Token refresh failed: ${res.status} ${await res.text()}`);
    }
    const data: any = await res.json();
    const updated: OAuthCredentials = {
        access_token: data.access_token,
        refresh_token: data.refresh_token ?? creds.refresh_token,
        expires_at: Date.now() + data.expires_in * 1000 - 5 * 60 * 1000,
    };
    saveCredentials(updated);
    return updated;
}

// =============================================================================
// Browser launcher
// =============================================================================

function openBrowser(url: string): void {
    try {
        const cmd =
            process.platform === 'darwin'
                ? 'open'
                : process.platform === 'win32'
                    ? 'cmd'
                    : 'xdg-open';
        const args = process.platform === 'win32' ? ['/c', 'start', '""', url] : [url];
        const child = spawn(cmd, args, { stdio: 'ignore', detached: true });
        child.on('error', () => {});
        child.unref();
    } catch {
        /* ignore */
    }
}

// =============================================================================
// Public: login flow
// =============================================================================

export type LoginNotifier = (msg: string) => void;

export async function runLoginFlow(
    log: LoginNotifier = console.log,
    notifyChat?: LoginNotifier
): Promise<OAuthCredentials> {
    const { verifier, challenge } = generatePKCE();
    // IMPORTANT: state === verifier. pi-mono anthropic.ts does this.
    const state = verifier;

    const authorizeUrl =
        AUTHORIZE_URL +
        '?' +
        new URLSearchParams({
            code: 'true',
            client_id: CLIENT_ID,
            response_type: 'code',
            redirect_uri: REDIRECT_URI,
            scope: SCOPES,
            code_challenge: challenge,
            code_challenge_method: 'S256',
            state,
        }).toString();

    const callbackPromise = waitForCallback(state, 5 * 60 * 1000);

    log('');
    log('========================================================');
    log('[AnthropicPlugin] Sign in with Claude required.');
    log('[AnthropicPlugin] Opening this URL in your browser:');
    log('');
    log('  ' + authorizeUrl);
    log('');
    log(`[AnthropicPlugin] Waiting for callback on ${REDIRECT_URI} …`);
    log('========================================================');
    log('');

    if (notifyChat) {
        notifyChat(
            `**Anthropic: sign in with Claude Pro/Max**\n\nA browser tab should have opened. If not, click: ${authorizeUrl}`
        );
    }
    openBrowser(authorizeUrl);

    const code = await callbackPromise;
    const creds = await exchangeCode(code, state, verifier);
    saveCredentials(creds);
    log('[AnthropicPlugin] Login successful. Tokens stored.');
    return creds;
}

let loginInflight: Promise<OAuthCredentials> | null = null;

export async function getValidCredentials(
    notifyChat?: LoginNotifier
): Promise<OAuthCredentials> {
    const SLACK_MS = 60 * 1000;
    let creds = loadCredentials();

    if (!creds) {
        if (!loginInflight) {
            loginInflight = runLoginFlow(console.log, notifyChat).finally(() => {
                loginInflight = null;
            });
        }
        creds = await loginInflight;
    } else if (creds.expires_at - SLACK_MS < Date.now()) {
        creds = await refreshAccessToken(creds);
    }
    return creds;
}
