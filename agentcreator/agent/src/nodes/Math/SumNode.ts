import { BaseSumNode } from '@codebolt/agent-shared-nodes';

export class SumNode extends BaseSumNode {
  constructor() {
    super();
  }

  // Backend execution logic
  onExecute() {
    const toNumber = (value: unknown): number => {
      if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
      }
      if (typeof value === 'string' && value.trim().length) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
      }
      return 0;
    };

    const A = toNumber(this.getInputData(0));
    const B = toNumber(this.getInputData(1));

    this.setOutputData(0, this.calculateSum(A as number, B as number));
  }
}