import { BaseReadManyFilesNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific ReadManyFiles Node - actual implementation
export class ReadManyFilesNode extends BaseReadManyFilesNode {
  constructor() {
    super();
  }

  async onExecute() {
    const params = this.getInputData(1) as any;

    if (!params || typeof params !== 'object' || !params.paths) {
      console.error('ReadManyFilesNode error: Missing required input (params object with paths)');
      this.setOutputData(1, false);
      this.setOutputData(2, null);
      return;
    }

    try {
      const result = await codebolt.fs.readManyFiles(params);
      this.setOutputData(1, true);
      this.setOutputData(2, result.files || null);
      this.triggerSlot(0, null, null);
    } catch (error) {
      console.error('ReadManyFilesNode error:', error);
      this.setOutputData(1, false);
      this.setOutputData(2, null);
    }
  }
}