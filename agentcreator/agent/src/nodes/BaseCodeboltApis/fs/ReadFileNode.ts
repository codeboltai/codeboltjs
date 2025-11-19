import { BaseReadFileNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific ReadFile Node - actual implementation
export class ReadFileNode extends BaseReadFileNode {
  constructor() {
    super();
  }

  async onExecute() {
    console.log('ReadFileNode executing:');
    // const triggerInput = this.getInputData(0);
    const filePath = this.getInputData(1) as string;

    console.log('ReadFileNode executing:');
    // console.log('  - Trigger input:', triggerInput);
    console.log('  - File path input:', filePath);
    console.log('  - All inputs:', this.inputs);

    if (!filePath) {
      console.error('ReadFileNode error: Missing required input (filePath)');
      this.setOutputData(1, false);
      this.setOutputData(2, '');
      return;
    }

    try {
      console.log(`ReadFileNode: Attempting to read file: ${filePath}`);
      const result = await codebolt.fs.readFile(filePath);
      console.log(`ReadFileNode: Successfully read file, content length: ${result.content?.length || 0}`);

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