import { BaseListDirectoryNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific ListDirectory Node - actual implementation
export class ListDirectoryNode extends BaseListDirectoryNode {
  constructor() {
    super();
  }

  async onExecute() {
    const params = this.getInputData(1) as any;

    if (!params || typeof params !== 'object' || !params.path) {
      console.error('ListDirectoryNode error: Missing required input (params object with path)');
      this.setOutputData(1, false);
      this.setOutputData(2, null);
      return;
    }

    try {
      const result = await codebolt.fs.listDirectory(params);
      this.setOutputData(1, true);
      this.setOutputData(2, result.entries || null);
      this.triggerSlot(0, null, null);
    } catch (error) {
      console.error('ListDirectoryNode error:', error);
      this.setOutputData(1, false);
      this.setOutputData(2, null);
    }
  }
}