import { BaseGrepSearchRequestNode } from '@codebolt/agent-shared-nodes';
import { codeutilsNotifications } from '@codebolt/codeboltjs';

// Backend GrepSearchRequestNode - actual implementation
export class GrepSearchRequestNode extends BaseGrepSearchRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const pattern: any = this.getInputData(1);
    const filePath: any = this.getInputData(2);
    const recursive: any = this.getInputData(3);
    const ignoreCase: any = this.getInputData(4);
    const maxResults: any = this.getInputData(5);
    const toolUseId: any = this.getInputData(6);

    // Validate required input
    if (!pattern || typeof pattern !== 'string' || !pattern.trim()) {
      const errorMessage = 'Error: Search pattern is required and must be non-empty string';
      console.error('GrepSearchRequestNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    // Validate optional inputs
    if (filePath !== undefined && typeof filePath !== 'string') {
      const errorMessage = 'Error: filePath must be a string value';
      console.error('GrepSearchRequestNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    if (recursive !== undefined && typeof recursive !== 'boolean') {
      const errorMessage = 'Error: recursive must be a boolean value';
      console.error('GrepSearchRequestNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    if (ignoreCase !== undefined && typeof ignoreCase !== 'boolean') {
      const errorMessage = 'Error: ignoreCase must be a boolean value';
      console.error('GrepSearchRequestNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    if (maxResults !== undefined && (typeof maxResults !== 'number' || maxResults <= 0)) {
      const errorMessage = 'Error: maxResults must be a positive number';
      console.error('GrepSearchRequestNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    if (toolUseId !== undefined && typeof toolUseId !== 'string') {
      const errorMessage = 'Error: toolUseId must be a string value';
      console.error('GrepSearchRequestNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    try {
      codeutilsNotifications.GrepSearchRequestNotify(
        pattern,
        filePath,
        recursive,
        ignoreCase,
        maxResults,
        toolUseId
      );

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send grep search request`;
      this.setOutputData(1, false);
      console.error('GrepSearchRequestNode error:', error);
    }
  }
}