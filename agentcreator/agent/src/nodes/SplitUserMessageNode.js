import { BaseSplitUserMessageNode } from '@agent-creator/shared-nodes';

// Agent-specific SplitUserMessage Node - execution logic only
export class SplitUserMessageNode extends BaseSplitUserMessageNode {
  constructor() {
    super();
  }

  // Override onExecute if needed for agent-specific logic
  async onExecute() {
    // Call the base implementation
    super.onExecute();
  }
}