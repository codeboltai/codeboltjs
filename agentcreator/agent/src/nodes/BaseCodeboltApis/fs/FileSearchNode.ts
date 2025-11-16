import { BaseFileSearchNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific FileSearch Node - actual implementation
export class FileSearchNode extends BaseFileSearchNode {
  constructor() {
    super();
  }

  async onExecute() {
    const query = this.getInputData(1) as string;

    if (!query) {
      console.error('FileSearchNode error: Missing required input (query)');
      this.setOutputData(1, false);
      this.setOutputData(2, null);
      return;
    }

    try {
      const result = await codebolt.fs.fileSearch(query);
      this.setOutputData(1, true);
      this.setOutputData(2, (result as any).files || null);
      this.triggerSlot(0, null, null);
    } catch (error) {
      console.error('FileSearchNode error:', error);
      this.setOutputData(1, false);
      this.setOutputData(2, null);
    }
  }
}