import { BaseStopProcessNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitChatFailure, emitChatSuccess } from './utils.js';

export class StopProcessNode extends BaseStopProcessNode {
  constructor() {
    super();
  }

  async onExecute() {
    try {
      await codebolt.chat.stopProcess();
      (globalThis as any).__agentFlowProcessStopNotified = true;
      (globalThis as any).__agentFlowComplete?.();
      emitChatSuccess(this, { stopped: true });
    } catch (error) {
      emitChatFailure(this, 'Failed to stop process', error);
    }
  }
}
