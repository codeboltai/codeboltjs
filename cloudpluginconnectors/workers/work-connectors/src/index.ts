type ConnectorStatus = 'planned' | 'active' | 'disabled';
type ConnectorCategory = 'dev' | 'work' | 'communication' | 'data';

interface Env {
  CONNECTOR_WORKER_ID?: string;
  CONNECTOR_WORKER_NAME?: string;
  CONNECTOR_WORKER_DESCRIPTION?: string;
  CLICKUP_CLIENT_ID?: string;
  CLICKUP_CLIENT_SECRET?: string;
  LINEAR_CLIENT_ID?: string;
  LINEAR_CLIENT_SECRET?: string;
  JIRA_CLIENT_ID?: string;
  JIRA_CLIENT_SECRET?: string;
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
      id: 'clickup',
      name: 'ClickUp',
      category: 'work',
      status: 'planned',
      authType: 'oauth2',
      installPath: '/clickup/install',
      callbackPath: '/clickup/callback',
      requiredSecrets: ['CLICKUP_CLIENT_ID', 'CLICKUP_CLIENT_SECRET'],
      tools: [
        tool('tasks:list', 'List tasks', 'List ClickUp tasks by workspace, space, list, or assignee.'),
        tool('tasks:create', 'Create task', 'Create a ClickUp task.'),
        tool('tasks:update', 'Update task', 'Update status, assignee, due date, or fields for a ClickUp task.'),
        tool('spaces:list', 'List spaces', 'List ClickUp spaces available to the OAuth token.'),
      ],
    },
    {
      id: 'linear',
      name: 'Linear',
      category: 'work',
      status: 'planned',
      authType: 'oauth2',
      installPath: '/linear/install',
      callbackPath: '/linear/callback',
      requiredSecrets: ['LINEAR_CLIENT_ID', 'LINEAR_CLIENT_SECRET'],
      tools: [
        tool('issues:list', 'List issues', 'List Linear issues by team, project, status, or assignee.'),
        tool('issues:create', 'Create issue', 'Create a Linear issue.'),
        tool('issues:update', 'Update issue', 'Update status, assignee, labels, or project for a Linear issue.'),
        tool('teams:list', 'List teams', 'List Linear teams available to the OAuth token.'),
      ],
    },
    {
      id: 'jira',
      name: 'Jira',
      category: 'work',
      status: 'planned',
      authType: 'oauth2',
      installPath: '/jira/install',
      callbackPath: '/jira/callback',
      requiredSecrets: ['JIRA_CLIENT_ID', 'JIRA_CLIENT_SECRET'],
      tools: [
        tool('issues:list', 'List issues', 'List Jira issues using project, board, sprint, or JQL filters.'),
        tool('issues:create', 'Create issue', 'Create a Jira issue.'),
        tool('issues:transition', 'Transition issue', 'Move a Jira issue through its workflow.'),
        tool('projects:list', 'List projects', 'List Jira projects visible to the OAuth token.'),
      ],
    },
  ];
}

function manifest(env: Env, origin: string) {
  const workerId = env.CONNECTOR_WORKER_ID || 'codebolt-connectors-work';
  const connectors = connectorDefinitions();
  return {
    version: '2026-07-27',
    worker: {
      id: workerId,
      name: env.CONNECTOR_WORKER_NAME || 'Work Management Connectors',
      description: env.CONNECTOR_WORKER_DESCRIPTION || 'Work-management connector worker.',
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
