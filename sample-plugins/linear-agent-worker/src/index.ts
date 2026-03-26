/**
 * Linear Agent Worker — Cloudflare Worker Entry Point
 *
 * Routes:
 *   POST /webhook              → Verify signature, parse AgentSessionEvent, forward to DO
 *   GET  /oauth/authorize      → Redirect to Linear OAuth (actor=app)
 *   GET  /oauth/callback       → Exchange code for token, store in KV
 *   GET  /ws/:appToken         → WebSocket upgrade, route to DO
 *   GET  /health               → Health check
 */

import type { Env, WebhookForwardPayload } from './types.js';
import {
  verifyWebhookSignature,
  parseAgentSessionEvent,
} from './linear/webhook.js';
import { handleAuthorize, handleCallback, getAccessTokenByOrg, storeOrgMapping } from './oauth/handler.js';

// Re-export the Durable Object class so wrangler can find it
export { LinearAgentHub } from './durable/linearAgentHub.js';

const worker: ExportedHandler<Env> = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // -----------------------------------------------------------------------
      // POST /webhook — Linear AgentSession webhook
      // -----------------------------------------------------------------------
      if (request.method === 'POST' && path === '/webhook') {
        return await handleWebhook(request, env);
      }

      // -----------------------------------------------------------------------
      // GET /oauth/authorize — Start OAuth flow
      // -----------------------------------------------------------------------
      if (request.method === 'GET' && path === '/oauth/authorize') {
        return handleAuthorize(request, env);
      }

      // -----------------------------------------------------------------------
      // GET /oauth/callback — OAuth callback
      // -----------------------------------------------------------------------
      if (request.method === 'GET' && path === '/oauth/callback') {
        return await handleCallback(request, env);
      }

      // -----------------------------------------------------------------------
      // GET /ws/:appToken — WebSocket connection for CodeBolt apps
      // -----------------------------------------------------------------------
      if (path.startsWith('/ws/')) {
        return await handleWebSocket(request, env, path);
      }

      // -----------------------------------------------------------------------
      // GET /health — Health check
      // -----------------------------------------------------------------------
      if (path === '/health') {
        return Response.json({
          status: 'ok',
          service: 'linear-agent-worker',
          timestamp: new Date().toISOString(),
        });
      }

      // -----------------------------------------------------------------------
      // GET / — Landing page
      // -----------------------------------------------------------------------
      if (path === '/') {
        return new Response(getLandingHTML(env), {
          headers: { 'Content-Type': 'text/html' },
        });
      }

      return new Response('Not found', { status: 404 });
    } catch (err) {
      console.error('[Worker] Unhandled error:', err);
      return new Response('Internal server error', { status: 500 });
    }
  },
};

export default worker;

// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------

async function handleWebhook(request: Request, env: Env): Promise<Response> {
  const body = await request.text();
  const signature = request.headers.get('linear-signature');

  // Verify webhook signature
  const valid = await verifyWebhookSignature(
    body,
    signature,
    env.LINEAR_WEBHOOK_SECRET
  );

  if (!valid) {
    console.error('[Worker] Invalid webhook signature');
    return new Response('Invalid signature', { status: 401 });
  }

  // Parse the event
  const event = parseAgentSessionEvent(body);
  if (!event) {
    // Not an AgentSession event or invalid — acknowledge but don't process
    return new Response('OK', { status: 200 });
  }

  const organizationId = event.organizationId;

  // Look up access token for this organization
  let accessToken = await getAccessTokenByOrg(env, organizationId);

  if (!accessToken) {
    // Try to find any stored token (single-tenant fallback)
    // In production, you'd want proper org → token mapping
    console.warn(
      `[Worker] No access token found for org ${organizationId}. ` +
        `The CodeBolt app must provide its token via WebSocket registration.`
    );
    // Use an empty token — the DO will use the app's token instead
    accessToken = '';
  }

  // Forward to the Durable Object
  // Use organizationId to route to the correct DO instance
  const doId = env.LINEAR_AGENT_HUB.idFromName(`hub-${organizationId}`);
  const stub = env.LINEAR_AGENT_HUB.get(doId);

  const forwardPayload: WebhookForwardPayload = {
    type: 'webhook',
    organizationId,
    accessToken,
    event,
  };

  const doResponse = await stub.fetch(
    new Request('https://do/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(forwardPayload),
    })
  );

  // Return 200 quickly (Linear requires response within 5s)
  return new Response('OK', { status: 200 });
}

async function handleWebSocket(
  request: Request,
  env: Env,
  path: string
): Promise<Response> {
  if (request.headers.get('Upgrade') !== 'websocket') {
    return new Response('Expected WebSocket upgrade', { status: 426 });
  }

  // Extract appToken from /ws/:appToken
  const appToken = path.split('/')[2];
  if (!appToken) {
    return new Response('Missing appToken in URL path', { status: 400 });
  }

  // Route to a DO instance based on appToken
  // For simplicity, each appToken maps to its own DO instance
  // In production, you might want to group by organization
  const doId = env.LINEAR_AGENT_HUB.idFromName(`hub-${appToken}`);
  const stub = env.LINEAR_AGENT_HUB.get(doId);

  // Forward the WebSocket upgrade request to the DO
  return stub.fetch(request);
}

// ---------------------------------------------------------------------------
// Landing page
// ---------------------------------------------------------------------------

function getLandingHTML(env: Env): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CodeBolt Linear Agent</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; margin: 0;
      background: #0f0f0f; color: #e0e0e0;
    }
    .card {
      text-align: center; padding: 3rem;
      background: #1a1a1a; border-radius: 12px;
      border: 1px solid #333; max-width: 560px;
    }
    h1 { margin: 0 0 0.5rem; font-size: 1.8rem; }
    .subtitle { color: #888; margin-bottom: 2rem; }
    .actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
    a.btn {
      display: inline-block; padding: 0.75rem 1.5rem;
      background: #5e6ad2; color: white; text-decoration: none;
      border-radius: 8px; font-weight: 600; transition: background 0.2s;
    }
    a.btn:hover { background: #4c55b3; }
    a.btn.secondary { background: #333; }
    a.btn.secondary:hover { background: #444; }
    .status { margin-top: 2rem; font-size: 0.85rem; color: #666; }
    code { background: #2a2a2a; padding: 0.2rem 0.4rem; border-radius: 4px; font-size: 0.85rem; }
  </style>
</head>
<body>
  <div class="card">
    <h1>&#9889; CodeBolt Linear Agent</h1>
    <p class="subtitle">Cloudflare Worker with Durable Objects proxy</p>
    <div class="actions">
      <a href="/oauth/authorize" class="btn">Install Agent</a>
      <a href="/health" class="btn secondary">Health Check</a>
    </div>
    <div class="status">
      <p>WebSocket endpoint: <code>wss://&lt;domain&gt;/ws/&lt;appToken&gt;</code></p>
      <p>Webhook endpoint: <code>https://&lt;domain&gt;/webhook</code></p>
    </div>
  </div>
</body>
</html>`;
}
