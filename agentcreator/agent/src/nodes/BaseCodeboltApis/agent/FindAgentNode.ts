import { BaseFindAgentNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitAgentFailure, emitAgentSuccess, getArrayInput, getNumberInput, getStringInput } from './utils.js';

export class FindAgentNode extends BaseFindAgentNode {
  constructor() {
    super();
  }

  async onExecute() {
    const task = getStringInput(this, 1, 'task');
    if (!task) {
      emitAgentFailure(this, 'Task is required to find agents');
      return;
    }

    const maxResult = getNumberInput(this, 2, 'maxResult', 1);
    const agents = getArrayInput(this, 3, 'agents', []) as unknown[];
    const location = getStringInput(this, 4, 'location', 'ALL');
    const source = getStringInput(this, 5, 'source', 'USE_VECTOR_DB');

    const normalizedAgents: string[] = agents
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

    try {
      const response = await codebolt.agent.findAgent(
        task,
        maxResult,
        normalizedAgents as never[],
        location as any,
        source as any
      );
      emitAgentSuccess(this, response);
    } catch (error) {
      emitAgentFailure(this, 'Failed to find agents', error);
    }
  }
}
