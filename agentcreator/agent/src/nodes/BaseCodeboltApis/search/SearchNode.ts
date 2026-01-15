import { BaseSearchNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific Search Node - actual implementation
export class SearchNode extends BaseSearchNode {
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
      console.error('SearchNode error:', errorMessage);
      this.setOutputData(2, false); // success output
      return;
    }

    try {
      const searchResults = await codebolt.search.search(finalQuery);

      // Update outputs with success results
      this.setOutputData(1, searchResults); // results output
      this.setOutputData(2, true); // success output

      // Trigger the searchCompleted event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to perform search`;
      this.setOutputData(1, ""); // results output
      this.setOutputData(2, false); // success output
      console.error('SearchNode error:', error);
    }
  }
}