import { BaseListFileNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific ListFile Node - actual implementation
export class ListFileNode extends BaseListFileNode {
  constructor() {
    super();
  }

  async onExecute() {
    const folderPath = this.getInputData(1) as string;
    const isRecursive = this.getInputData(2) as boolean || false;

    if (!folderPath) {
      console.error('ListFileNode error: Missing required input (folderPath)');
      this.setOutputData(1, false);
      this.setOutputData(2, null);
      return;
    }

    try {
      const result = await codebolt.fs.listFile(folderPath, isRecursive);
      this.setOutputData(1, true);
      this.setOutputData(2, result.files || null);
      this.triggerSlot(0, null, null);
    } catch (error) {
      console.error('ListFileNode error:', error);
      this.setOutputData(1, false);
      this.setOutputData(2, null);
    }
  }
}