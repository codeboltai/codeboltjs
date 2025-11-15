import { BaseCreateFolderNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific CreateFolder Node - actual implementation
export class CreateFolderNode extends BaseCreateFolderNode {
  constructor() {
    super();
  }

  async onExecute() {
    const folderName = this.getInputData(1) as string;
    const folderPath = this.getInputData(2) as string;

    if (!folderName || !folderPath) {
      console.error('CreateFolderNode error: Missing required inputs (folderName, folderPath)');
      this.setOutputData(1, false);
      return;
    }

    try {
      await codebolt.fs.createFolder(folderName, folderPath);
      this.setOutputData(1, true);
      this.triggerSlot(0, null, null);
    } catch (error) {
      console.error('CreateFolderNode error:', error);
      this.setOutputData(1, false);
    }
  }
}