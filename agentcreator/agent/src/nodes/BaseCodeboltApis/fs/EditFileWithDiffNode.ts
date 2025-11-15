import { BaseEditFileWithDiffNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific EditFileWithDiff Node - actual implementation
export class EditFileWithDiffNode extends BaseEditFileWithDiffNode {
  constructor() {
    super();
  }

  async onExecute() {
    const targetFile = this.getInputData(1) as string;
    const codeEdit = this.getInputData(2) as string;
    const diffIdentifier = this.getInputData(3) as string;
    const prompt = this.getInputData(4) as string;
    const applyModel = this.getInputData(5) as string;

    if (!targetFile || !codeEdit || !diffIdentifier || !prompt) {
      console.error('EditFileWithDiffNode error: Missing required inputs (targetFile, codeEdit, diffIdentifier, prompt)');
      this.setOutputData(1, false);
      return;
    }

    try {
      await codebolt.fs.editFileWithDiff(
        targetFile,
        codeEdit,
        diffIdentifier,
        prompt,
        applyModel
      );
      this.setOutputData(1, true);
      this.triggerSlot(0, null, null);
    } catch (error) {
      console.error('EditFileWithDiffNode error:', error);
      this.setOutputData(1, false);
    }
  }
}