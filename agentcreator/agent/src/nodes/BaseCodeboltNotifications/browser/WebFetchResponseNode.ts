import { BaseWebFetchResponseNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific WebFetchResponse Node - actual implementation
export class WebFetchResponseNode extends BaseWebFetchResponseNode {
  constructor() {
    super();
  }

  async onExecute() {
    const content = this.getInputData(1);
    const isError = this.getInputData(2) || false;
    const data = this.getInputData(3);

    // Validate content is provided
    if (content === null || content === undefined) {
      const errorMessage = 'Error: Content is required for web fetch response';
      console.error('WebFetchResponseNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    try {
      // Call the browser notification function
      codebolt.notify.browser.WebFetchResponseNotify(
        content,
        isError as boolean,
        undefined, // toolUseId - let it auto-generate
        data
      );

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the responseSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send web fetch response`;
      this.setOutputData(1, false);
      console.error('WebFetchResponseNode error:', error);
    }
  }
}
