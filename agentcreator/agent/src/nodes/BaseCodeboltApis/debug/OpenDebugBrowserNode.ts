import { BaseOpenDebugBrowserNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific OpenDebugBrowser Node - actual implementation
export class OpenDebugBrowserNode extends BaseOpenDebugBrowserNode {
  constructor() {
    super();
  }

  async onExecute() {
    const url = this.getInputData(1) || this.properties.url;
    const port = this.getInputData(2) || this.properties.port;

    if (!url || typeof url !== 'string' || !url.trim()) {
      const errorMessage = 'Error: URL cannot be empty';
      console.error('OpenDebugBrowserNode error:', errorMessage);
      this.setOutputData(2, false);
      this.setOutputData(1, null);
      return;
    }

    if (!port || typeof port !== 'number' || port <= 0 || port > 65535) {
      const errorMessage = 'Error: Port must be a valid number between 1 and 65535';
      console.error('OpenDebugBrowserNode error:', errorMessage);
      this.setOutputData(2, false);
      this.setOutputData(1, null);
      return;
    }

    try {
      const result = await codebolt.debug.openDebugBrowser(url, port);

      // Update outputs with success results
      this.setOutputData(1, result);
      this.setOutputData(2, true);

      // Trigger the browserOpened event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error opening debug browser: ${error}`;
      this.setOutputData(1, null);
      this.setOutputData(2, false);
      console.error('OpenDebugBrowserNode error:', error);
    }
  }
}