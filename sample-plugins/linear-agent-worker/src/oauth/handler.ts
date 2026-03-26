/**
 * OAuth 2.0 flow handler for Linear agent installation.
 *
 * - /oauth/authorize → Redirects to Linear OAuth with actor=app
 * - /oauth/callback  → Exchanges code for token, stores in KV
 */

import type { Env } from '../types.js';

const LINEAR_AUTHORIZE_URL = 'https://linear.app/oauth/authorize';
const LINEAR_TOKEN_URL = 'https://api.linear.app/oauth/token';
const LINEAR_API_URL = 'https://api.linear.app/graphql';

/**
 * Handle the /oauth/authorize route.
 * Redirects to Linear's OAuth authorization page with actor=app.
 */
export function handleAuthorize(request: Request, env: Env): Response {
  const url = new URL(request.url);
  const callbackUrl = `${env.WORKER_URL}/oauth/callback`;

  const params = new URLSearchParams({
    client_id: env.LINEAR_CLIENT_ID,
    redirect_uri: callbackUrl,
    response_type: 'code',
    scope: 'read,write,app:assignable,app:mentionable',
    actor: 'app',
    // Use state parameter for CSRF protection
    state: crypto.randomUUID(),
  });

  const authorizeUrl = `${LINEAR_AUTHORIZE_URL}?${params.toString()}`;
  return Response.redirect(authorizeUrl, 302);
}

/**
 * Handle the /oauth/callback route.
 * Exchanges the authorization code for an access token and stores it in KV.
 */
export async function handleCallback(
  request: Request,
  env: Env
): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    return new Response(
      getResultHTML(
        false,
        `OAuth authorization failed: ${error}`
      ),
      { status: 400, headers: { 'Content-Type': 'text/html' } }
    );
  }

  if (!code) {
    return new Response(
      getResultHTML(false, 'Missing authorization code'),
      { status: 400, headers: { 'Content-Type': 'text/html' } }
    );
  }

  try {
    // Exchange code for access token
    const callbackUrl = `${env.WORKER_URL}/oauth/callback`;
    const tokenResponse = await fetch(LINEAR_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: env.LINEAR_CLIENT_ID,
        client_secret: env.LINEAR_CLIENT_SECRET,
        redirect_uri: callbackUrl,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      const text = await tokenResponse.text();
      throw new Error(`Token exchange failed: ${tokenResponse.status} ${text}`);
    }

    const tokenData = (await tokenResponse.json()) as {
      access_token: string;
      token_type: string;
      expires_in?: number;
      scope?: string;
    };

    const accessToken = tokenData.access_token;
    if (!accessToken) {
      throw new Error('No access_token in token response');
    }

    // Query viewer and organization to get IDs for token storage
    const viewerResponse = await fetch(LINEAR_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: accessToken,
      },
      body: JSON.stringify({
        query: `query { viewer { id name } organization { id name } }`,
      }),
    });

    const viewerData = (await viewerResponse.json()) as {
      data?: {
        viewer?: { id: string; name: string };
        organization?: { id: string; name: string };
      };
    };

    const viewerId = viewerData.data?.viewer?.id;
    const viewerName = viewerData.data?.viewer?.name ?? 'Agent';
    const orgId = viewerData.data?.organization?.id;
    const orgName = viewerData.data?.organization?.name ?? 'Unknown';

    if (!viewerId) {
      throw new Error('Could not retrieve viewer ID after OAuth');
    }

    // Store the access token in KV, keyed by viewer ID (app user in workspace)
    await env.OAUTH_TOKENS.put(
      `token:${viewerId}`,
      JSON.stringify({
        accessToken,
        viewerId,
        viewerName,
        installedAt: new Date().toISOString(),
        scope: tokenData.scope,
      })
    );

    // Store by organization ID for webhook lookup
    if (orgId) {
      await env.OAUTH_TOKENS.put(
        `org:${orgId}`,
        JSON.stringify({ accessToken, organizationId: orgId })
      );
      console.log(
        `[OAuth] Stored org mapping: ${orgId} (${orgName})`
      );
    }

    console.log(
      `[OAuth] Successfully installed agent as ${viewerName} (${viewerId}) in org ${orgName} (${orgId})`
    );

    return new Response(
      getResultHTML(
        true,
        `Agent installed successfully as "${viewerName}" (ID: ${viewerId}). You can now close this tab.`
      ),
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[OAuth] Callback error:', message);
    return new Response(
      getResultHTML(false, `Installation failed: ${message}`),
      { status: 500, headers: { 'Content-Type': 'text/html' } }
    );
  }
}

/**
 * Look up an access token from KV by viewer/app user ID.
 */
export async function getAccessToken(
  env: Env,
  viewerId: string
): Promise<string | null> {
  const data = await env.OAUTH_TOKENS.get(`token:${viewerId}`);
  if (!data) return null;

  try {
    const parsed = JSON.parse(data) as { accessToken: string };
    return parsed.accessToken;
  } catch {
    return null;
  }
}

/**
 * Look up an access token by organization ID.
 */
export async function getAccessTokenByOrg(
  env: Env,
  organizationId: string
): Promise<string | null> {
  const data = await env.OAUTH_TOKENS.get(`org:${organizationId}`);
  if (!data) return null;

  try {
    const parsed = JSON.parse(data) as { accessToken: string };
    return parsed.accessToken;
  } catch {
    return null;
  }
}

/**
 * Store the mapping from organization ID to access token.
 * Called when we first receive a webhook and can associate org → token.
 */
export async function storeOrgMapping(
  env: Env,
  organizationId: string,
  accessToken: string
): Promise<void> {
  await env.OAUTH_TOKENS.put(
    `org:${organizationId}`,
    JSON.stringify({ accessToken, organizationId })
  );
}

// ---------------------------------------------------------------------------
// HTML templates
// ---------------------------------------------------------------------------

function getResultHTML(success: boolean, message: string): string {
  const color = success ? '#22c55e' : '#ef4444';
  const icon = success ? '&#10003;' : '&#10007;';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CodeBolt Agent – ${success ? 'Installed' : 'Error'}</title>
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
      border: 1px solid #333; max-width: 480px;
    }
    .icon {
      font-size: 3rem; color: ${color};
      width: 64px; height: 64px; line-height: 64px;
      border-radius: 50%; border: 3px solid ${color};
      margin: 0 auto 1.5rem; display: block;
    }
    h1 { margin: 0 0 1rem; font-size: 1.5rem; }
    p { color: #999; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="card">
    <span class="icon">${icon}</span>
    <h1>${success ? 'Agent Installed' : 'Installation Failed'}</h1>
    <p>${message}</p>
  </div>
</body>
</html>`;
}
