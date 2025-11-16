import { BaseParseCSVNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { coerceStringInput } from './utils';

// Backend-specific ParseCSV Node - actual implementation
export class ParseCSVNode extends BaseParseCSVNode {
  constructor() {
    super();
  }

  async onExecute() {
    const rawCsv = this.getInputData(1) ?? this.properties?.csvString;
    const csvString = coerceStringInput(rawCsv);

    if (csvString === null) {
      const errorMessage = 'Error: CSV string input is required';
      console.error('ParseCSVNode error:', errorMessage);
      this.setOutputData(4, false);
      this.setOutputData(1, null);
      this.setOutputData(2, null);
      this.setOutputData(3, null);
      this.setOutputData(5, errorMessage);
      return;
    }

    try {
      const result = codebolt.outputparsers.parseCSV(csvString);

      // Update outputs with parsing results
      this.setOutputData(1, result);
      this.setOutputData(2, result.success);
      this.setOutputData(3, result.parsed || null);
      this.setOutputData(4, result.success);
      this.setOutputData(5, result.error ? result.error.message : null);

      // Trigger the csvParsed event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error parsing CSV: ${error}`;
      this.setOutputData(1, null);
      this.setOutputData(2, false);
      this.setOutputData(3, null);
      this.setOutputData(4, false);
      this.setOutputData(5, errorMessage);
      console.error('ParseCSVNode error:', error);
    }
  }
}