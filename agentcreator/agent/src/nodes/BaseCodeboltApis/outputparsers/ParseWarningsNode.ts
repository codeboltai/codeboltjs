import { BaseParseWarningsNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { coerceParsableOutput } from './utils';

// Backend-specific ParseWarnings Node - actual implementation
export class ParseWarningsNode extends BaseParseWarningsNode {
  constructor() {
    super();
  }

  async onExecute() {
    const rawOutput = this.getInputData(1);
    const output = coerceParsableOutput(rawOutput);

    if (!output) {
      const errorMessage = 'Error: Output input is required';
      console.error('ParseWarningsNode error:', errorMessage);
      this.setOutputData(2, false);
      this.setOutputData(1, null);
      return;
    }

    try {
      const warnings = codebolt.outputparsers.parseWarnings(output);

      // Update outputs with parsing results
      this.setOutputData(1, warnings);
      this.setOutputData(2, true);

      // Trigger the warningsParsed event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error parsing warnings: ${error}`;
      this.setOutputData(1, []);
      this.setOutputData(2, false);
      console.error('ParseWarningsNode error:', error);
    }
  }
}