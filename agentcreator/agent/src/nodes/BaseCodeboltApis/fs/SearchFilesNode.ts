import { BaseSearchFilesNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific SearchFiles Node - actual implementation
export class SearchFilesNode extends BaseSearchFilesNode {
  constructor() {
    super();
  }

  async onExecute() {
    const path = this.getInputData(1) as string;
    const regex = this.getInputData(2) as string;
    const filePattern = this.getInputData(3) as string;

    if (!path || !regex) {
      console.error('SearchFilesNode error: Missing required inputs (path, regex)');
      this.setOutputData(1, false);
      this.setOutputData(2, null);
      return;
    }

    try {
      const result = await codebolt.fs.searchFiles(path, regex, filePattern || '');
      this.setOutputData(1, true);
      this.setOutputData(2, result.files || null);
      this.triggerSlot(0, null, null);
    } catch (error) {
      console.error('SearchFilesNode error:', error);
      this.setOutputData(1, false);
      this.setOutputData(2, null);
    }
  }
}