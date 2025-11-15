import { BaseReadFileNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific ReadFile Node - actual implementation
export class ReadFileNode extends BaseReadFileNode {
  constructor() {
    super();
  }

  async onExecute() {
    const filePath = this.getInputData(1) as string;

    if (!filePath) {
      console.error('ReadFileNode error: Missing required input (filePath)');
      this.setOutputData(1, false);
      this.setOutputData(2, '');
      return;
    }

    try {
      const result = await codebolt.fs.readFile(filePath);
      this.setOutputData(1, true);
      this.setOutputData(2, result.content || '');
      this.triggerSlot(0, null, null);
    } catch (error) {
      console.error('ReadFileNode error:', error);
      this.setOutputData(1, false);
      this.setOutputData(2, '');
    }
  }
}