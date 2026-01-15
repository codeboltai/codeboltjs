import { BaseBranchNode } from '@codebolt/agent-shared-nodes';

// Frontend Branch Node - UI only
export class BranchNode extends BaseBranchNode {
  constructor() {
    super();
  }

  onExecute() {
    // console.log(`BranchNode ${this.id} - UI only, execution handled by backend`);
  }
}
