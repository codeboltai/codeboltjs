import { BaseNotNode } from '@codebolt/agent-shared-nodes';

// Frontend NOT Node - UI only
export class NotNode extends BaseNotNode {
  constructor() {
    super();
  }

  onExecute() {
    // console.log(`NotNode ${this.id} - UI only, execution handled by backend`);
  }
}
