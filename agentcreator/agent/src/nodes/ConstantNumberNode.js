import { BaseConstantNumberNode } from '@agent-creator/shared-nodes';

// Backend-specific Constant Number Node - execution logic only
export class ConstantNumberNode extends BaseConstantNumberNode {
  constructor() {
    super();
    // Backend doesn't need UI widgets
  }

  // Backend execution logic
  onExecute() {
    const value = this.validateValue(this.properties.value);
    this.setOutputData(0, value);

    // console.log(`ConstantNumberNode ${this.id}: outputting ${value}`);
  }
}