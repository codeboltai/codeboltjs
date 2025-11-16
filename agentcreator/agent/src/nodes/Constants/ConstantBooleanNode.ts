import { BaseConstantBooleanNode } from '@agent-creator/shared-nodes';

// Backend-specific Constant Boolean Node - execution logic only
export class ConstantBooleanNode extends BaseConstantBooleanNode {
  constructor() {
    super();
    // Backend doesn't need UI widgets
  }

  // Backend execution logic
  onExecute() {
    const value = this.validateValue(this.properties.value);
    this.setOutputData(0, value);

    // console.log(`ConstantBooleanNode ${this.id}: outputting ${value}`);
  }
}