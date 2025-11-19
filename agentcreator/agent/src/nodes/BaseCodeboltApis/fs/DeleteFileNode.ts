import { BaseDeleteFileNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific DeleteFile Node - actual implementation
export class DeleteFileNode extends BaseDeleteFileNode {
  constructor() {
    super();
  }

  async onExecute() {
    const filename = this.getInputData(1) as string;
    const filePath = this.getInputData(2) as string;

    if (!filename || !filePath) {
      console.error('DeleteFileNode error: Missing required inputs (filename, filePath)');
      this.setOutputData(1, false);
      return;
    }

    try {
      await codebolt.fs.deleteFile(filename, filePath);
      this.setOutputData(1, true);
      this.triggerSlot(0, null, null);
    } catch (error) {
      console.error('DeleteFileNode error:', error);
      this.setOutputData(1, false);
    }
  }
}