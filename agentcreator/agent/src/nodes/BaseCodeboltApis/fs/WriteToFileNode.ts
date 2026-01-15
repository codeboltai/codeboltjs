import { BaseWriteToFileNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific WriteToFile Node - actual implementation
export class WriteToFileNode extends BaseWriteToFileNode {
  constructor() {
    super();
  }

  async onExecute() {
    console.log('WriteToFileNode executing:');
    const relPath = this.getInputData(1) as string;
    const newContent = this.getInputData(2) as string;

    if (!relPath || newContent === undefined) {
      console.error('WriteToFileNode error: Missing required inputs (relPath, newContent)');
      this.setOutputData(1, false);
      return;
    }

    try {
      await codebolt.fs.writeToFile(relPath, newContent);
      this.setOutputData(1, true);
      this.triggerSlot(0, null, null);
    } catch (error) {
      console.error('WriteToFileNode error:', error);
      this.setOutputData(1, false);
    }
  }
}