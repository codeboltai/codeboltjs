import { BaseConstantStringNode } from '@codebolt/agent-shared-nodes';

// Backend-specific Constant String Node - execution logic only
export class ConstantStringNode extends BaseConstantStringNode {
  constructor() {
    super();
    // Backend doesn't need UI widgets
  }

  // Override configure to ensure properties are properly set
  configure(data: any) {
    super.configure(data);
    // Debug log to verify properties are loaded
    console.log(`ConstantStringNode ${this.id}: configured with value="${this.properties.value}"`);
  }

  // Backend execution logic
  onExecute() {
    const value = this.validateValue(this.properties.value);
    this.setOutputData(0, value);

    console.log(`ConstantStringNode ${this.id}: outputting "${value}"`);
  }
}