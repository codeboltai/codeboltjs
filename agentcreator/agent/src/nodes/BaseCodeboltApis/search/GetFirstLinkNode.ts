import { BaseGetFirstLinkNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific GetFirstLink Node - actual implementation
export class GetFirstLinkNode extends BaseGetFirstLinkNode {
  constructor() {
    super();
  }

  async onExecute() {
    const query: any = this.getInputData(1);

    let finalQuery = "";
    if (query && typeof query === 'string' && query.trim()) {
      finalQuery = query;
    } else {
      const errorMessage = 'Error: Search query cannot be empty';
      console.error('GetFirstLinkNode error:', errorMessage);
      this.setOutputData(2, false); // success output
      return;
    }

    try {
      const firstLink = await codebolt.search.get_first_link(finalQuery);

      // Update outputs with success results
      this.setOutputData(1, firstLink); // link output
      this.setOutputData(2, true); // success output

      // Trigger the linkRetrieved event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to get first link`;
      this.setOutputData(1, ""); // link output
      this.setOutputData(2, false); // success output
      console.error('GetFirstLinkNode error:', error);
    }
  }
}