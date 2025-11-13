import { BaseSumNode } from '@agent-creator/shared-nodes';

// Backend-specific SumNode - execution logic only
export class SumNode extends BaseSumNode {
  constructor() {
    super();
    // Backend doesn't need UI widgets
  }

  // Backend execution logic
  onExecute() {
    const a = this.getInputData(0) || 0;
    const b = this.getInputData(1) || 0;
    const sum = this.calculateSum(a, b);
    this.setOutputData(0, sum);

    // Optional: Log execution for debugging (commented out to avoid JSON protocol interference)
    // // console.log(`SumNode ${this.id}: ${a} + ${b} = ${sum} (precision: ${this.properties.precision})`);
  }

  // Enhanced error handling for backend
  getInputData(index) {
    try {
      const data = super.getInputData ? super.getInputData(index) : this.getInputData(index);
      return data;
    } catch (error) {
      console.error(`SumNode ${this.id}: Error getting input ${index}:`, error);
      return 0;
    }
  }
}