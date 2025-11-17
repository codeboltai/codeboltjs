import { BaseListAgentsNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitAgentFailure, emitAgentSuccess, getStringInput } from './utils.js';

export class ListAgentsNode extends BaseListAgentsNode {
  constructor() {
    super();
  }

  async onExecute() {
    const agentType = getStringInput(this, 1, 'agentType', 'DOWNLOADED');

    try {
      const response = await codebolt.agent.getAgentsList(agentType as any);
      emitAgentSuccess(this, response);
    } catch (error) {
      emitAgentFailure(this, 'Failed to fetch agents list', error);
    }
  }
}
