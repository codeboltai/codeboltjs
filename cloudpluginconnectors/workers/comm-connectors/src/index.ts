type ConnectorStatus = 'planned' | 'active' | 'disabled';
type ConnectorCategory = 'dev' | 'work' | 'communication' | 'data';

interface Env {
  CONNECTOR_WORKER_ID?: string;
  CONNECTOR_WORKER_NAME?: string;
  CONNECTOR_WORKER_DESCRIPTION?: string;
  SLACK_CLIENT_ID?: string;
  SLACK_CLIENT_SECRET?: string;
  SLACK_SIGNING_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
}

interface ConnectorTool {
  id: string;
  name: string;
  displayName: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

interface ConnectorDefinition {
  id: string;
  name: string;
  category: ConnectorCategory;
  status: ConnectorStatus;
  authType: 'github_app' | 'oauth2' | 'api_key';
  installPath: string;
  callbackPath: string;
  requiredSecrets: string[];
  tools: ConnectorTool[];
}

const json = (body: unknown, init: ResponseInit = {}) => new Response(JSON.stringify(body, null, 2), {
  ...init,
  headers: {
    'content-type': 'application/json',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type,authorization',
    ...(init.headers || {}),
  },
});

const tool = (id: string, displayName: string, description: string): ConnectorTool => ({
  id,
  name: id.replace(/[^a-zA-Z0-9_-]+/g, '_'),
  displayName,
  description,
  inputSchema: { type: 'object', properties: {}, additionalProperties: true },
});

function connectorDefinitions(): ConnectorDefinition[] {
  return [
    {
      id: 'slack',
      name: 'Slack',
      category: 'communication',
      status: 'planned',
      authType: 'oauth2',
      installPath: '/slack/install',
      callbackPath: '/slack/callback',
      requiredSecrets: ['SLACK_CLIENT_ID', 'SLACK_CLIENT_SECRET', 'SLACK_SIGNING_SECRET'],
      tools: [
        tool('channels:list', 'List channels', 'List Slack channels visible to the bot or user token.'),
        tool('messages:read', 'Read messages', 'Read Slack messages from an approved channel.'),
        tool('messages:send', 'Send message', 'Send a Slack message to an approved channel or user.'),
      ],
    },
    {
      id: 'gmail',
      name: 'Gmail',
      category: 'communication',
      status: 'planned',
      authType: 'oauth2',
      installPath: '/gmail/install',
      callbackPath: '/gmail/callback',
      requiredSecrets: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
      tools: [
        tool('messages:list', 'List email', 'List Gmail messages matching a query.'),
        tool('messages:read', 'Read email', 'Read a Gmail message by id.'),
        tool('drafts:create', 'Create draft', 'Create a Gmail draft.'),
      ],
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      category: 'communication',
      status: 'planned',
      authType: 'oauth2',
      installPath: '/google-calendar/install',
      callbackPath: '/google-calendar/callback',
      requiredSecrets: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
      tools: [
        tool('calendars:list', 'List calendars', 'List calendars visible to the OAuth token.'),
        tool('events:list', 'List events', 'List calendar events in a time range.'),
        tool('events:create', 'Create event', 'Create a calendar event.'),
      ],
    },
  ];
}

function manifest(env: Env, origin: string) {
  const workerId = env.CONNECTOR_WORKER_ID || 'codebolt-connectors-comm';
  const connectors = connectorDefinitions();
  return {
    version: '2026-07-27',
    worker: {
      id: workerId,
      name: env.CONNECTOR_WORKER_NAME || 'Communication Connectors',
      description: env.CONNECTOR_WORKER_DESCRIPTION || 'Communication connector worker.',
      routePrefix: origin,
      status: 'planned',
      connectors: connectors.map((connector) => connector.id),
    },
    connectors: connectors.map((connector) => ({
      ...connector,
      workerId,
      installPath: `${origin}${connector.installPath}`,
      callbackPath: `${origin}${connector.callbackPath}`,
      capabilities: connector.tools.map((entry) => entry.id),
    })),
  };
}

async function execute(request: Request) {
  const body = await request.json().catch(() => ({})) as any;
  return json({
    success: false,
    error: 'Connector execution is not implemented in this template worker.',
    connectorId: body.connectorId,
    capabilityId: body.capabilityId,
  }, { status: 501 });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') return json({ ok: true });
    const url = new URL(request.url);
    const origin = `${url.protocol}//${url.host}`;

    if (url.pathname === '/' || url.pathname === '/manifest') return json(manifest(env, origin));
    if (url.pathname === '/tools') return json({ tools: manifest(env, origin).connectors.flatMap((connector) => connector.tools) });
    if (url.pathname === '/execute' && request.method === 'POST') return execute(request);

    const [, connectorId, action] = url.pathname.split('/');
    const connector = connectorDefinitions().find((entry) => entry.id === connectorId);
    if (connector && action === 'install') {
      return json({ success: false, message: `${connector.name} install flow is not configured yet.` }, { status: 501 });
    }
    if (connector && action === 'callback') {
      return json({ success: false, message: `${connector.name} callback flow is not configured yet.` }, { status: 501 });
    }

    return json({ success: false, error: 'Not found' }, { status: 404 });
  },
};
