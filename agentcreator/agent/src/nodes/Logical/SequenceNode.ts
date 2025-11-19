import { BaseSequenceNode } from '@codebolt/agent-shared-nodes';

// Backend-specific Sequence Node - execution logic only
export class SequenceNode extends BaseSequenceNode {
  private current_sequence: string | null = null;

  constructor() {
    super();
  }

  onExecute() {
    const index = this.getInputData(0) as number;
    const sequence = this.getInputData(1);

    // Use input sequence if provided, otherwise use property
    const finalSequence = (sequence as string) || (this.properties.sequence as string);

    // Update current sequence if it changed
    if (sequence && sequence !== this.current_sequence) {
      this.current_sequence = sequence as string;
    }

    const safeIndex = index !== null ? Math.round(index) : 0;
    const result = this.selectFromSequence(finalSequence, safeIndex);

    this.setOutputData(0, result);
    // console.log(`SequenceNode ${this.id}: index ${safeIndex} from "${finalSequence}" = "${result}"`);
  }
}