/**
 * Linear GraphQL client for agent operations.
 *
 * Unlike the plugin version that uses @linear/sdk with a static API key,
 * this client makes raw fetch calls with per-request OAuth access tokens
 * to support multi-tenant usage from the Durable Object.
 */

import type {
  AgentActivityContent,
  AgentSessionState,
  AgentPlanStep,
} from '../types.js';

const LINEAR_API_URL = 'https://api.linear.app/graphql';

// ---------------------------------------------------------------------------
// GraphQL operations
// ---------------------------------------------------------------------------

const EMIT_ACTIVITY_MUTATION = `
  mutation AgentActivityCreate($input: AgentActivityCreateInput!) {
    agentActivityCreate(input: $input) {
      success
      agentActivity {
        id
      }
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

const VIEWER_QUERY = `
  query Me {
    viewer {
      id
      name
      displayName
    }
  }
`;

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

export class LinearAgentClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  updateAccessToken(token: string): void {
    this.accessToken = token;
  }

  /**
   * Emit an agent activity to a session.
   * Uses the new `content` payload format per Linear's agent protocol.
   */
  async emitActivity(
    sessionId: string,
    content: AgentActivityContent,
    options?: { ephemeral?: boolean }
  ): Promise<{ success: boolean; activityId?: string }> {
    const input: Record<string, unknown> = {
      agentSessionId: sessionId,
      content,
    };

    if (options?.ephemeral) {
      input.ephemeral = true;
    }

    const result = await this.request(EMIT_ACTIVITY_MUTATION, { input });
    return {
      success: result.agentActivityCreate?.success ?? false,
      activityId: result.agentActivityCreate?.agentActivity?.id,
    };
  }

  /**
   * Update the state of an agent session.
   */
  async updateSessionState(
    sessionId: string,
    state: AgentSessionState
  ): Promise<boolean> {
    const result = await this.request(UPDATE_SESSION_MUTATION, {
      id: sessionId,
      input: { state },
    });
    return result.agentSessionUpdate?.success ?? false;
  }

  /**
   * Upsert the plan (checklist) on an agent session.
   * Replaces the entire plan array.
   */
  async upsertPlan(
    sessionId: string,
    steps: AgentPlanStep[]
  ): Promise<boolean> {
    const result = await this.request(UPDATE_SESSION_MUTATION, {
      id: sessionId,
      input: { plan: steps },
    });
    return result.agentSessionUpdate?.success ?? false;
  }

  /**
   * Set external URLs on an agent session.
   */
  async updateExternalUrls(
    sessionId: string,
    urls: Array<{ label: string; url: string }>
  ): Promise<boolean> {
    const result = await this.request(UPDATE_SESSION_MUTATION, {
      id: sessionId,
      input: { externalUrls: urls },
    });
    return result.agentSessionUpdate?.success ?? false;
  }

  /**
   * Validate the connection by querying the viewer.
   */
  async validateConnection(): Promise<{
    valid: boolean;
    id?: string;
    name?: string;
    error?: string;
  }> {
    try {
      const result = await this.request(VIEWER_QUERY);
      const viewer = result.viewer;
      return {
        valid: true,
        id: viewer?.id,
        name: viewer?.name ?? viewer?.displayName ?? 'Connected',
      };
    } catch (err) {
      return {
        valid: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }

  // -------------------------------------------------------------------------
  // Internal
  // -------------------------------------------------------------------------

  private async request(
    query: string,
    variables?: Record<string, unknown>
  ): Promise<Record<string, any>> {
    const response = await fetch(LINEAR_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.accessToken,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Linear API error ${response.status}: ${text.substring(0, 200)}`
      );
    }

    const json = (await response.json()) as {
      data?: Record<string, any>;
      errors?: Array<{ message: string }>;
    };

    if (json.errors?.length) {
      throw new Error(
        `Linear GraphQL error: ${json.errors.map((e) => e.message).join(', ')}`
      );
    }

    return json.data ?? {};
  }
}
