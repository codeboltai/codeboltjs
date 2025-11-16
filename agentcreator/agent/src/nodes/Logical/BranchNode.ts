import { BaseBranchNode } from '@agent-creator/shared-nodes';

// Backend-specific Branch Node - execution logic only
export class BranchNode extends BaseBranchNode {
  constructor() {
    super();
  }

  // Backend execution logic - triggers appropriate branch based on condition
  onExecute() {
    const condition = this.getInputData(1);

    try {
      if (condition) {
        // Trigger true branch
        this.triggerSlot(0, null, null);
      } else {
        // Trigger false branch
        this.triggerSlot(1, null, null);
      }
    } catch (error) {
      console.error('BranchNode: Error in branch execution:', error);
    }
  }
}