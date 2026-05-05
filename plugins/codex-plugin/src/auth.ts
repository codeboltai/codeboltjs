/**
 * ChatGPT "Sign in with ChatGPT" OAuth flow for the Codex plugin.
 *
 * Constants and flow ported from pi-mono's openai-codex OAuth module
 * (packages/ai/src/utils/oauth/openai-codex.ts). These endpoints are
 * UNOFFICIAL and may change. Keep this file in sync with pi-mono upstream.
 */

import { spawn } from 'node:child_process';
import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import * as http from 'node:http';
import * as os from 'node:os';
import * as path from 'node:path';

// =============================================================================
// Constants — from pi-mono packages/ai/src/utils/oauth/openai-codex.ts
// =============================================================================
export const CLIENT_ID = 'app_EMoamEEZ73f0CkXaXp7hrann';
export const AUTHORIZE_URL = 'https://auth.openai.com/oauth/authorize';
export const TOKEN_URL = 'https://auth.openai.com/oauth/token';
export const SCOPE = 'openid profile email offline_access';
export const CALLBACK_PORT = 1455;
export const REDIRECT_URI = `http://localhost:${CALLBACK_PORT}/auth/callback`;
export const JWT_CLAIM_PATH = 'https://api.openai.com/auth';
export const ORIGINATOR = 'pi';

// =============================================================================
// Token storage
// =============================================================================

export interface OAuthCredentials {
    access_token: string;
    refresh_token: string;
    /** Unix ms */
    expires_at: number;
    /** Extracted from the access-token JWT; sent as chatgpt-account-id header */
    account_id: string;
}

function authFilePath(): string {
    const dir = path.join(os.homedir(), '.codebolt', 'plugins', 'codex-plugin');
    fs.mkdirSync(dir, { recursive: true });
    return path.join(dir, 'auth.json');
}

export function loadCredentials(): OAuthCredentials | null {
    try {
        const raw = fs.readFileSync(authFilePath(), 'utf-8');
        const parsed = JSON.parse(raw);
        if (!parsed?.access_token || !parsed?.refresh_token || !parsed?.account_id) return null;
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
// JWT / PKCE helpers
// =============================================================================

function base64url(buf: Buffer): string {
    return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function generatePKCE(): { verifier: string; challenge: string } {
    const verifier = base64url(crypto.randomBytes(32));
    const challenge = base64url(crypto.createHash('sha256').update(verifier).digest());
    return { verifier, challenge };
}

function decodeJwtPayload(token: string): any {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid JWT');
    const json = Buffer.from(
        parts[1].replace(/-/g, '+').replace(/_/g, '/'),
        'base64'
    ).toString('utf-8');
    return JSON.parse(json);
}

function extractAccountId(accessToken: string): string {
    const payload = decodeJwtPayload(accessToken);
    const id = payload?.[JWT_CLAIM_PATH]?.chatgpt_account_id;
    if (typeof id !== 'string' || !id) {
        throw new Error('No chatgpt_account_id in access token');
    }
    return id;
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
            if (url.pathname !== '/auth/callback') {
                res.writeHead(404).end('Not found');
                return;
            }
            const error = url.searchParams.get('error');
            if (error) {
                res.writeHead(400, { 'Content-Type': 'text/html' }).end(
                    renderAuthPage({
                        title: 'Sign-in was not completed',
                        message: 'The browser callback reached CodeBolt, but OpenAI returned an authentication error.',
                        tone: 'error',
                        detail: error,
                    })
                );
                cleanup();
                reject(new Error(`OAuth error: ${error}`));
                return;
            }
            if (url.searchParams.get('state') !== expectedState) {
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
            const code = url.searchParams.get('code');
            if (!code) {
                res.writeHead(400).end('Missing code');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' }).end(
                renderAuthPage({
                    title: 'Signed in to ChatGPT',
                    message: 'Your CodeBolt session is now connected. Return to the app to continue using Codebolt.',
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
        server.listen(CALLBACK_PORT, '127.0.0.1');
    });
}

// =============================================================================
// Token exchange / refresh
// =============================================================================

async function exchangeCode(code: string, verifier: string): Promise<OAuthCredentials> {
    const res = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: CLIENT_ID,
            code,
            redirect_uri: REDIRECT_URI,
            code_verifier: verifier,
        }).toString(),
    });
    if (!res.ok) {
        throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
    }
    const data: any = await res.json();
    const access_token: string = data.access_token;
    return {
        access_token,
        refresh_token: data.refresh_token,
        expires_at: Date.now() + (data.expires_in ?? 3600) * 1000,
        account_id: extractAccountId(access_token),
    };
}

export async function refreshAccessToken(
    creds: OAuthCredentials
): Promise<OAuthCredentials> {
    const res = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: CLIENT_ID,
            refresh_token: creds.refresh_token,
        }).toString(),
    });
    if (!res.ok) {
        throw new Error(`Token refresh failed: ${res.status} ${await res.text()}`);
    }
    const data: any = await res.json();
    const access_token: string = data.access_token;
    const updated: OAuthCredentials = {
        access_token,
        refresh_token: data.refresh_token ?? creds.refresh_token,
        expires_at: Date.now() + (data.expires_in ?? 3600) * 1000,
        account_id: extractAccountId(access_token),
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
// Public: full login flow
// =============================================================================

export type LoginNotifier = (msg: string) => void;

export async function runLoginFlow(
    log: LoginNotifier = console.log,
    notifyChat?: LoginNotifier
): Promise<OAuthCredentials> {
    const { verifier, challenge } = generatePKCE();
    const state = base64url(crypto.randomBytes(16));

    const authorizeUrl =
        AUTHORIZE_URL +
        '?' +
        new URLSearchParams({
            response_type: 'code',
            client_id: CLIENT_ID,
            redirect_uri: REDIRECT_URI,
            scope: SCOPE,
            state,
            code_challenge: challenge,
            code_challenge_method: 'S256',
            id_token_add_organizations: 'true',
            codex_cli_simplified_flow: 'true',
            originator: ORIGINATOR,
        }).toString();

    const callbackPromise = waitForCallback(state, 5 * 60 * 1000);

    log('');
    log('========================================================');
    log('[CodexPlugin] Sign in with ChatGPT required.');
    log('[CodexPlugin] Opening this URL in your browser:');
    log('');
    log('  ' + authorizeUrl);
    log('');
    log(`[CodexPlugin] Waiting for callback on ${REDIRECT_URI} …`);
    log('========================================================');
    log('');

    if (notifyChat) {
        notifyChat(
            `**OpenAI Codex: sign in with ChatGPT**\n\nA browser tab should have opened. If not, click: ${authorizeUrl}`
        );
    }
    openBrowser(authorizeUrl);

    const code = await callbackPromise;
    const creds = await exchangeCode(code, verifier);
    saveCredentials(creds);
    log('[CodexPlugin] Login successful. Tokens stored.');
    return creds;
}

let loginInflight: Promise<OAuthCredentials> | null = null;

/**
 * Returns a valid (non-expired) credential bundle, running the OAuth flow
 * or refreshing as needed. Safe to call on every request.
 */
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
