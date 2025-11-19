import { BaseUpdateFileNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific UpdateFile Node - actual implementation
export class UpdateFileNode extends BaseUpdateFileNode {
  constructor() {
    super();
  }

  async onExecute() {
    const filename = this.getInputData(1) as string;
    const filePath = this.getInputData(2) as string;
    const newContent = this.getInputData(3) as string;

    if (!filename || !filePath || newContent === undefined) {
      console.error('UpdateFileNode error: Missing required inputs (filename, filePath, newContent)');
      this.setOutputData(1, false);
      return;
    }

    try {
      await codebolt.fs.updateFile(filename, filePath, newContent);
      this.setOutputData(1, true);
      this.triggerSlot(0, null, null);
    } catch (error) {
      console.error('UpdateFileNode error:', error);
      this.setOutputData(1, false);
    }
  }
}