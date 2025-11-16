import { BaseWebFetchRequestNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific WebFetchRequest Node - actual implementation
export class WebFetchRequestNode extends BaseWebFetchRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const url = this.getInputData(1);
    const method = this.getInputData(2);
    const headers = this.getInputData(3);
    const body = this.getInputData(4);
    const timeout = this.getInputData(5);

    // Validate required URL parameter
    if (!url || typeof url !== 'string' || !url.trim()) {
      const errorMessage = 'Error: URL cannot be empty';
      console.error('WebFetchRequestNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    try {
      // Call the browser notification function
      codebolt.notify.browser.WebFetchRequestNotify(
        url,
        method,
        headers,
        body,
        timeout
      );

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send web fetch request`;
      this.setOutputData(1, false);
      console.error('WebFetchRequestNode error:', error);
    }
  }
}
