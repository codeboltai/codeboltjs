import { BaseEditFileAndApplyDiffNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific EditFileAndApplyDiff Node - actual implementation
export class EditFileAndApplyDiffNode extends BaseEditFileAndApplyDiffNode {
  constructor() {
    super();
  }

  async onExecute() {
    const filePath = this.getInputData(1) || this.properties.filePath;
    const diff = this.getInputData(2) || this.properties.diff;
    const diffIdentifier = this.getInputData(3) || this.properties.diffIdentifier;
    const prompt = this.getInputData(4) || this.properties.prompt;
    const applyModel = this.getInputData(5) || this.properties.applyModel;

    // Validate required parameters
    if (!filePath || typeof filePath !== 'string' || !filePath.trim()) {
      const errorMessage = 'Error: File path cannot be empty';
      console.error('EditFileAndApplyDiffNode error:', errorMessage);
      this.setOutputData(2, false);
      this.setOutputData(1, null);
      return;
    }

    if (!diff || typeof diff !== 'string' || !diff.trim()) {
      const errorMessage = 'Error: Diff cannot be empty';
      console.error('EditFileAndApplyDiffNode error:', errorMessage);
      this.setOutputData(2, false);
      this.setOutputData(1, null);
      return;
    }

    if (!diffIdentifier || typeof diffIdentifier !== 'string' || !diffIdentifier.trim()) {
      const errorMessage = 'Error: Diff identifier cannot be empty';
      console.error('EditFileAndApplyDiffNode error:', errorMessage);
      this.setOutputData(2, false);
      this.setOutputData(1, null);
      return;
    }

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      const errorMessage = 'Error: Prompt cannot be empty';
      console.error('EditFileAndApplyDiffNode error:', errorMessage);
      this.setOutputData(2, false);
      this.setOutputData(1, null);
      return;
    }

    try {
      const result = await codebolt.utils.editFileAndApplyDiff(
        filePath,
        diff,
        diffIdentifier,
        prompt,
        applyModel
      );

      // Update outputs with success results
      this.setOutputData(1, result);
      this.setOutputData(2, true);

      // Trigger the fileEdited event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error editing file and applying diff: ${error}`;
      this.setOutputData(1, null);
      this.setOutputData(2, false);
      console.error('EditFileAndApplyDiffNode error:', error);
    }
  }
}