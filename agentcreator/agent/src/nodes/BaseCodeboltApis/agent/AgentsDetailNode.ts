import { BaseAgentsDetailNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitAgentFailure, emitAgentSuccess, getArrayInput } from './utils.js';

export class AgentsDetailNode extends BaseAgentsDetailNode {
  constructor() {
    super();
  }

  async onExecute() {
    const agentList = getArrayInput(this, 1, 'agentList', []) as unknown[];
    const normalizedAgents: string[] = agentList
      .map((value): string => {
        if (typeof value === 'string') {
          return value.trim();
        }
        if (value === null || value === undefined) {
          return '';
        }
        return String(value).trim();
      })
      .filter((value) => value.length > 0);

    if (!normalizedAgents.length) {
      emitAgentFailure(this, 'Agent list is required to fetch details');
      return;
    }

    try {
      const response = await codebolt.agent.getAgentsDetail(normalizedAgents as never[]);
      emitAgentSuccess(this, response);
    } catch (error) {
      emitAgentFailure(this, 'Failed to fetch agents detail', error);
    }
  }
}
