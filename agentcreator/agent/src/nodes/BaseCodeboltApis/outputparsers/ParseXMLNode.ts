import { BaseParseXMLNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { coerceStringInput } from './utils';

// Backend-specific ParseXML Node - actual implementation
export class ParseXMLNode extends BaseParseXMLNode {
  constructor() {
    super();
  }

  async onExecute() {
    const rawXml = this.getInputData(1) ?? this.properties?.xmlString;
    const xmlString = coerceStringInput(rawXml);

    if (xmlString === null) {
      const errorMessage = 'Error: XML string input is required';
      console.error('ParseXMLNode error:', errorMessage);
      this.setOutputData(4, false);
      this.setOutputData(1, null);
      this.setOutputData(2, null);
      this.setOutputData(3, null);
      this.setOutputData(5, errorMessage);
      return;
    }

    try {
      const result = codebolt.outputparsers.parseXML(xmlString);

      // Update outputs with parsing results
      this.setOutputData(1, result);
      this.setOutputData(2, result.success);
      this.setOutputData(3, result.parsed || null);
      this.setOutputData(4, result.success);
      this.setOutputData(5, result.error ? result.error.message : null);

      // Trigger the xmlParsed event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error parsing XML: ${error}`;
      this.setOutputData(1, null);
      this.setOutputData(2, false);
      this.setOutputData(3, null);
      this.setOutputData(4, false);
      this.setOutputData(5, errorMessage);
      console.error('ParseXMLNode error:', error);
    }
  }
}