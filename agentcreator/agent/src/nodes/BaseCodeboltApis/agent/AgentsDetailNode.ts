import { BaseAgentsDetailNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitAgentFailure, emitAgentSuccess, getArrayInput } from './utils';

export class AgentsDetailNode extends BaseAgentsDetailNode {
  constructor() {
    super();
  }

  async onExecute() {
    const agentList = getArrayInput(this, 1, 'agentList', []);

    if (!agentList.length) {
      emitAgentFailure(this, 'Agent list is required to fetch details');
      return;
    }

    try {
      const response = await codebolt.agent.getAgentsDetail(agentList);
      emitAgentSuccess(this, response);
    } catch (error) {
      emitAgentFailure(this, 'Failed to fetch agents detail', error);
    }
  }
}
