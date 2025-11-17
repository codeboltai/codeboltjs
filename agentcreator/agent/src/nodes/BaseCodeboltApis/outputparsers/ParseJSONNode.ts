import { BaseParseJSONNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { coerceStringInput } from './utils.js';

// Backend-specific ParseJSON Node - actual implementation
export class ParseJSONNode extends BaseParseJSONNode {
  constructor() {
    super();
  }

  async onExecute() {
    const rawJson = this.getInputData(1) ?? this.properties?.jsonString;
    const jsonString = coerceStringInput(rawJson);

    if (jsonString === null) {
      const errorMessage = 'Error: JSON string input is required';
      console.error('ParseJSONNode error:', errorMessage);
      this.setOutputData(4, false);
      this.setOutputData(1, null);
      this.setOutputData(2, null);
      this.setOutputData(3, null);
      this.setOutputData(5, errorMessage);
      return;
    }

    try {
      const result = codebolt.outputparsers.parseJSON(jsonString);

      // Update outputs with parsing results
      this.setOutputData(1, result);
      this.setOutputData(2, result.success);
      this.setOutputData(3, result.parsed || null);
      this.setOutputData(4, result.success);
      this.setOutputData(5, result.error ? result.error.message : null);

      // Trigger the jsonParsed event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error parsing JSON: ${error}`;
      this.setOutputData(1, null);
      this.setOutputData(2, false);
      this.setOutputData(3, null);
      this.setOutputData(4, false);
      this.setOutputData(5, errorMessage);
      console.error('ParseJSONNode error:', error);
    }
  }
}