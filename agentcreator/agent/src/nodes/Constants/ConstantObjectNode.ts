import { BaseConstantObjectNode } from '@codebolt/agent-shared-nodes';

// Backend-specific Constant Object Node - execution logic only
export class ConstantObjectNode extends BaseConstantObjectNode {
  constructor() {
    super();
    // Backend doesn't need UI widgets
  }

  // Backend execution logic
  onExecute() {
    const value = this.validateValue(this.properties.value);
    this.setOutputData(0, value);

    // console.log(`ConstantObjectNode ${this.id}: outputting object`, value);
  }
}