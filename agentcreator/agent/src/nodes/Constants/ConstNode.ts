import { BaseConstNode } from '@agent-creator/shared-nodes';

// Backend-specific ConstNode - execution logic only
export class ConstNode extends BaseConstNode {
  constructor() {
    super();
    // Backend doesn't need UI widgets
  }

  // Backend execution logic
  onExecute() {
    const value = this.properties.value || 0;
    this.setOutputData(0, value);
  }

  // Backend-specific validation
  validateValue(value) {
    const num = parseFloat(value);
    if (isNaN(num)) {
      console.warn(`ConstNode ${this.id}: Invalid value ${value}, using 0`);
      return 0;
    }
    return num;
  }
}