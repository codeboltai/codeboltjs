import { BaseUserMessageNode } from '@agent-creator/shared-nodes';

// Backend-specific UserMessage Node - execution logic only
export class UserMessageNode extends BaseUserMessageNode {
  constructor() {
    super();
    // Backend doesn't need UI widgets
  }

  async onExecute() {
    const reqMessage = this.getInputData(0) || global.executionContext?.message;
    if (!reqMessage) {
      console.error('UserMessageNode: reqMessage input is required');
      this.setOutputData(0, null);
      return;
    }

    try {
      // Import and use actual UserMessage class from @codebolt/utils
      const { UserMessage } = require("@codebolt/utils");
      const userMessage = new UserMessage(reqMessage);

      this.setOutputData(0, userMessage);
      // console.log(`UserMessageNode ${this.id}: Created UserMessage instance for message length: ${reqMessage.length}`);
    } catch (error) {
      console.error(`UserMessageNode ${this.id}: Error creating UserMessage:`, error);
      this.setOutputData(0, null);
    }
  }
}