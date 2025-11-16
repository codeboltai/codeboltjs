import { BaseEditFileAndApplyDiffNode } from '@agent-creator/shared-nodes';
import { editFileAndApplyDiff } from '@codebolt/codeboltjs';

// Backend-specific EditFileAndApplyDiff Node - actual implementation
export class EditFileAndApplyDiffNode extends BaseEditFileAndApplyDiffNode {
  constructor() {
    super();
  }

  async onExecute() {
    const filePath: any = this.getInputData(1);
    const diff: any = this.getInputData(2);
    const diffIdentifier: any = this.getInputData(3);
    const prompt: any = this.getInputData(4);
    const applyModel: any = this.getInputData(5);

    if (!filePath || !diff || !diffIdentifier || !prompt) {
      console.error('EditFileAndApplyDiffNode error: filePath, diff, diffIdentifier, and prompt are required');
      this.setOutputData(2, false);
      return;
    }

    try {
      const result = await editFileAndApplyDiff(
        filePath,
        diff,
        diffIdentifier,
        prompt,
        applyModel
      );

      // Update outputs with success results
      this.setOutputData(1, result); // result output
      this.setOutputData(2, true); // success output

      // Trigger the diffApplied event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to edit file and apply diff`;
      this.setOutputData(1, null); // result output
      this.setOutputData(2, false); // success output
      console.error('EditFileAndApplyDiffNode error:', error);
    }
  }
}
