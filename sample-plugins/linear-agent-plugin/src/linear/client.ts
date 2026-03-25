import { LinearClient } from '@linear/sdk';
import type {
    AgentSession,
    AgentActivity,
    AgentPlanStep,
    AgentSessionState,
    ConnectionValidation,
} from './types.js';

const FETCH_SESSIONS_QUERY = `
  query AgentSessions {
    agentSessions(filter: { state: { in: ["pending", "active"] } }) {
      nodes {
        id
        state
        promptContext
        issue {
          id
          identifier
          title
          description
          url
          project { name }
          team { name key }
          labels { nodes { name } }
          priority
          state { name }
        }
        signals { type data }
        plan { id steps { id title status } }
        createdAt
        updatedAt
      }
    }
  }
`;

const EMIT_ACTIVITY_MUTATION = `
  mutation AgentActivityCreate($input: AgentActivityCreateInput!) {
    agentActivityCreate(input: $input) {
      success
    }
  }
`;

const UPDATE_SESSION_MUTATION = `
  mutation AgentSessionUpdate($id: String!, $input: AgentSessionUpdateInput!) {
    agentSessionUpdate(id: $id, input: $input) {
      success
    }
  }
`;

export class LinearAgentClient {
    private client: LinearClient;

    constructor(apiKey: string) {
        this.client = new LinearClient({ apiKey });
    }

    updateApiKey(apiKey: string): void {
        this.client = new LinearClient({ apiKey });
    }

    async fetchActiveSessions(): Promise<AgentSession[]> {
        try {
            const response = await this.client.client.rawRequest(FETCH_SESSIONS_QUERY);
            const data = response.data as any;
            const nodes = data?.agentSessions?.nodes ?? [];
            return nodes.map((node: any) => ({
                id: node.id,
                state: node.state,
                promptContext: node.promptContext ?? '',
                issueId: node.issue?.id ?? '',
                issue: node.issue
                    ? {
                          id: node.issue.id,
                          identifier: node.issue.identifier,
                          title: node.issue.title,
                          description: node.issue.description,
                          url: node.issue.url,
                          project: node.issue.project,
                          team: node.issue.team,
                          labels: node.issue.labels?.nodes ?? [],
                          priority: node.issue.priority,
                          state: node.issue.state,
                      }
                    : undefined,
                signals: node.signals ?? [],
                plan: node.plan,
                createdAt: node.createdAt,
                updatedAt: node.updatedAt,
            }));
        } catch (err) {
            console.error('[LinearClient] Failed to fetch sessions:', err);
            throw err;
        }
    }

    async emitActivity(sessionId: string, activity: AgentActivity): Promise<void> {
        await this.client.client.rawRequest(EMIT_ACTIVITY_MUTATION, {
            input: {
                sessionId,
                type: activity.type,
                body: activity.content,
                ...(activity.metadata ? { metadata: activity.metadata } : {}),
            },
        });
    }

    async updateSessionState(sessionId: string, state: AgentSessionState): Promise<void> {
        await this.client.client.rawRequest(UPDATE_SESSION_MUTATION, {
            id: sessionId,
            input: { state },
        });
    }

    async upsertPlan(
        sessionId: string,
        steps: Array<{ title: string; status: string }>
    ): Promise<void> {
        await this.client.client.rawRequest(UPDATE_SESSION_MUTATION, {
            id: sessionId,
            input: {
                plan: steps.map((s) => ({
                    title: s.title,
                    status: s.status,
                })),
            },
        });
    }

    async validateConnection(): Promise<ConnectionValidation> {
        try {
            const viewer = await this.client.viewer;
            return { valid: true, name: viewer.name ?? viewer.displayName ?? 'Connected' };
        } catch (err) {
            return {
                valid: false,
                error: err instanceof Error ? err.message : 'Unknown error',
            };
        }
    }
}
