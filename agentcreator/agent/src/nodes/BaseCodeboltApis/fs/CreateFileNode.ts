import { BaseCreateFileNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific CreateFile Node - actual implementation
export class CreateFileNode extends BaseCreateFileNode {
  constructor() {
    super();
  }

  async onExecute() {
    console.log('CreateFileNode onExecute');
    const fileName = this.getInputData(1) as string;
    const source = this.getInputData(2) as string;
    const filePath = this.getInputData(3) as string;

    if (!fileName || !filePath || source === undefined) {
      console.error('CreateFileNode error: Missing required inputs (fileName, source, filePath)');
      this.setOutputData(1, false);
      return;
    }

    try {
      await codebolt.fs.createFile(fileName, source, filePath);
      this.setOutputData(1, true);
      this.triggerSlot(0, null, null);
    } catch (error) {
      console.error('CreateFileNode error:', error);
      this.setOutputData(1, false);
    }
  }
}