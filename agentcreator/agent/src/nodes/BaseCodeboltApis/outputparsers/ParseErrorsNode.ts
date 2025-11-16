import { BaseParseErrorsNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { coerceParsableOutput } from './utils';

// Backend-specific ParseErrors Node - actual implementation
export class ParseErrorsNode extends BaseParseErrorsNode {
  constructor() {
    super();
  }

  async onExecute() {
    const rawOutput = this.getInputData(1);
    const output = coerceParsableOutput(rawOutput);

    if (!output) {
      const errorMessage = 'Error: Output input is required';
      console.error('ParseErrorsNode error:', errorMessage);
      this.setOutputData(2, false);
      this.setOutputData(1, null);
      return;
    }

    try {
      const errors = codebolt.outputparsers.parseErrors(output);

      // Update outputs with parsing results
      this.setOutputData(1, errors);
      this.setOutputData(2, true);

      // Trigger the errorsParsed event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error parsing errors: ${error}`;
      this.setOutputData(1, []);
      this.setOutputData(2, false);
      console.error('ParseErrorsNode error:', error);
    }
  }
}