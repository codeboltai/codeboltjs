import { BaseConstantStringNode } from '@agent-creator/shared-nodes';

// Backend-specific Constant String Node - execution logic only
export class ConstantStringNode extends BaseConstantStringNode {
  constructor() {
    super();
    // Backend doesn't need UI widgets
  }

  // Backend execution logic
  onExecute() {
    const value = this.validateValue(this.properties.value);
    this.setOutputData(0, value);

    // console.log(`ConstantStringNode ${this.id}: outputting "${value}"`);
  }
}