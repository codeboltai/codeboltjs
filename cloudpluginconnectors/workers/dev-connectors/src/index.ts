type ConnectorStatus = 'planned' | 'active' | 'disabled';
type ConnectorCategory = 'dev' | 'work' | 'communication' | 'data';

interface Env {
  CONNECTOR_WORKER_ID?: string;
  CONNECTOR_WORKER_NAME?: string;
  CONNECTOR_WORKER_DESCRIPTION?: string;
  GITHUB_APP_ID?: string;
  GITHUB_APP_PRIVATE_KEY?: string;
  GITLAB_CLIENT_ID?: string;
  GITLAB_CLIENT_SECRET?: string;
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
      id: 'github',
      name: 'GitHub',
      category: 'dev',
      status: 'active',
      authType: 'github_app',
      installPath: '/github/install',
      callbackPath: '/github/callback',
      requiredSecrets: ['GITHUB_APP_ID', 'GITHUB_APP_PRIVATE_KEY'],
      tools: [
        tool('repositories:list', 'List repositories', 'List repositories visible to the GitHub installation.'),
        tool('repositories:clone', 'Clone repository', 'Resolve clone metadata for a repository.'),
        tool('branches:read', 'Read branches', 'Read branch metadata for a repository.'),
        tool('pull-requests:create', 'Create pull request', 'Create a pull request from a source branch.'),
        tool('pull-requests:merge', 'Merge pull request', 'Merge an existing pull request.'),
      ],
    },
    {
      id: 'gitlab',
      name: 'GitLab',
      category: 'dev',
      status: 'planned',
      authType: 'oauth2',
      installPath: '/gitlab/install',
      callbackPath: '/gitlab/callback',
      requiredSecrets: ['GITLAB_CLIENT_ID', 'GITLAB_CLIENT_SECRET'],
      tools: [
        tool('repositories:list', 'List projects', 'List GitLab projects visible to the OAuth token.'),
        tool('repositories:clone', 'Clone project', 'Resolve clone metadata for a GitLab project.'),
        tool('merge-requests:create', 'Create merge request', 'Create a GitLab merge request.'),
      ],
    },
  ];
}

function manifest(env: Env, origin: string) {
  const workerId = env.CONNECTOR_WORKER_ID || 'codebolt-connectors-dev';
  const connectors = connectorDefinitions();
  return {
    version: '2026-07-27',
    worker: {
      id: workerId,
      name: env.CONNECTOR_WORKER_NAME || 'Developer Connectors',
      description: env.CONNECTOR_WORKER_DESCRIPTION || 'Source-control connector worker.',
      routePrefix: origin,
      status: 'active',
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
