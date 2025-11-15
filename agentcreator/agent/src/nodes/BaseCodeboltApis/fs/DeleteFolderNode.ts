import { BaseDeleteFolderNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific DeleteFolder Node - actual implementation
export class DeleteFolderNode extends BaseDeleteFolderNode {
  constructor() {
    super();
  }

  async onExecute() {
    const foldername = this.getInputData(1) as string;
    const folderpath = this.getInputData(2) as string;

    if (!foldername || !folderpath) {
      console.error('DeleteFolderNode error: Missing required inputs (foldername, folderpath)');
      this.setOutputData(1, false);
      return;
    }

    try {
      await codebolt.fs.deleteFolder(foldername, folderpath);
      this.setOutputData(1, true);
      this.triggerSlot(0, null, null);
    } catch (error) {
      console.error('DeleteFolderNode error:', error);
      this.setOutputData(1, false);
    }
  }
}