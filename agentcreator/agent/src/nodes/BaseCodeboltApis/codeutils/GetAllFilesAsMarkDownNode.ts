import { BaseGetAllFilesAsMarkDownNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific GetAllFilesAsMarkDown Node - actual implementation
export class GetAllFilesAsMarkDownNode extends BaseGetAllFilesAsMarkDownNode {
  constructor() {
    super();
  }

  async onExecute() {
    try {
      const result = await codebolt.codeutils.getAllFilesAsMarkDown();

      // Update outputs with success results
      this.setOutputData(1, result);
      this.setOutputData(2, true);

      // Trigger the markdownRetrieved event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error getting all files as markdown: ${error}`;
      this.setOutputData(1, "");
      this.setOutputData(2, false);
      console.error('GetAllFilesAsMarkDownNode error:', error);
    }
  }
}