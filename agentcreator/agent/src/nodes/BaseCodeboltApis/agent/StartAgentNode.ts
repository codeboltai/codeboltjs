import { BaseStartAgentNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitAgentFailure, emitAgentSuccess, getStringInput } from './utils.js';

export class StartAgentNode extends BaseStartAgentNode {
  constructor() {
    super();
  }

  async onExecute() {
    const agentId = getStringInput(this, 1, 'agentId');
    const task = getStringInput(this, 2, 'task');

    if (!agentId || !task) {
      emitAgentFailure(this, 'Agent ID and task are required');
      return;
    }

    try {
      const response = await codebolt.agent.startAgent(agentId, task);
      emitAgentSuccess(this, response);
    } catch (error) {
      emitAgentFailure(this, 'Failed to start agent', error);
    }
  }
}
