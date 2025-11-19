import { BaseParseTextNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { coerceStringInput } from './utils.js';

// Backend-specific ParseText Node - actual implementation
export class ParseTextNode extends BaseParseTextNode {
  constructor() {
    super();
  }

  async onExecute() {
    const rawText = this.getInputData(1) ?? this.properties?.text;
    const text = coerceStringInput(rawText);

    if (text === null) {
      const errorMessage = 'Error: Text input is required';
      console.error('ParseTextNode error:', errorMessage);
      this.setOutputData(4, false);
      this.setOutputData(1, null);
      this.setOutputData(2, null);
      this.setOutputData(3, null);
      this.setOutputData(5, errorMessage);
      return;
    }

    try {
      const result = codebolt.outputparsers.parseText(text);

      // Update outputs with parsing results
      this.setOutputData(1, result);
      this.setOutputData(2, result.success);
      this.setOutputData(3, result.parsed || null);
      this.setOutputData(4, result.success);
      this.setOutputData(5, result.error ? result.error.message : null);

      // Trigger the textParsed event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error parsing text: ${error}`;
      this.setOutputData(1, null);
      this.setOutputData(2, false);
      this.setOutputData(3, null);
      this.setOutputData(4, false);
      this.setOutputData(5, errorMessage);
      console.error('ParseTextNode error:', error);
    }
  }
}