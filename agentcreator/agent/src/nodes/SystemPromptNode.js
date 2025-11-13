import { BaseSystemPromptNode } from '@agent-creator/shared-nodes';

// Backend-specific SystemPrompt Node - execution logic only
export class SystemPromptNode extends BaseSystemPromptNode {
  constructor() {
    super();
    // Backend doesn't need UI widgets
  }

  async onExecute() {
    const promptContent = this.getInputData(0) || this.properties.promptContent;
    const filePath = this.getInputData(1) || this.properties.filePath;
    const profile = this.getInputData(2) || this.properties.profile;

    try {
      // Import and use actual SystemPrompt class from @codebolt/utils
      const { SystemPrompt } = require("@codebolt/utils");

      // Use actual SystemPrompt constructor - it takes filePath and profile
      const systemPrompt = new SystemPrompt(filePath, profile);

      this.setOutputData(0, systemPrompt);
      // console.log(`SystemPromptNode ${this.id}: Created SystemPrompt instance from ${filePath} with profile: ${profile}`);
    } catch (error) {
      console.error(`SystemPromptNode ${this.id}: Error creating SystemPrompt:`, error);
      this.setOutputData(0, null);
    }
  }
}