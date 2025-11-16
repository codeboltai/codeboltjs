import { BaseMessageProcessorNode } from '@agent-creator/shared-nodes';
import { createDefaultMessageProcessor } from '@codebolt/agent/unified';

// Backend-specific Message Processor Node - actual implementation
export class MessageProcessorNode extends BaseMessageProcessorNode {
  private processor: any = null;

  constructor() {
    super();
  }

  async onExecute() {
    try {
      // Create default message processor with configuration
      this.processor = createDefaultMessageProcessor();

      // If there are additional configuration options from properties
      if (this.properties.baseSystemPrompt) {
        // Set base system prompt if available
        if (this.processor.setMetaData) {
          this.processor.setMetaData('baseSystemPrompt', this.properties.baseSystemPrompt as string);
        }
      }

      // Update outputs with created processor
      this.setOutputData(1, this.processor); // processor
      this.setOutputData(2, true); // success
      this.setOutputData(3, null); // error

      // Trigger creation event
      this.triggerSlot(0, null, null); // onCreated

    } catch (error) {
      const errorMessage = `Error: Failed to create message processor - ${error instanceof Error ? error.message : 'Unknown error'}`;
      this.setOutputData(2, false); // success
      this.setOutputData(3, errorMessage); // error
      this.triggerSlot(1, null, null); // onError
      console.error('MessageProcessorNode error:', error);
    }
  }
}