import { BaseInitialPromptGeneratorNode } from '@agent-creator/shared-nodes';
import { InitialPromptGenerator } from '@codebolt/unified';

// Backend-specific Initial Prompt Generator Node - actual implementation
export class InitialPromptGeneratorNode extends BaseInitialPromptGeneratorNode {
  private promptGenerator: InitialPromptGenerator | null = null;

  constructor() {
    super();
  }

  async onExecute() {
    try {
      const message = this.getInputData(1) as any;
      const processors = this.getInputData(2) as any[] || [];

      // Validate inputs
      if (!message) {
        this.setOutputData(3, false);
        this.setOutputData(4, 'Error: Message input is required');
        this.triggerSlot(1, null, null); // onError
        return;
      }

      // Create initial prompt generator instance
      this.promptGenerator = new InitialPromptGenerator({
        processors,
        baseSystemPrompt: this.properties.baseSystemPrompt || 'You are a helpful assistant.',
        enableLogging: this.properties.enableLogging !== undefined ? this.properties.enableLogging : true,
        enableTemplating: this.properties.enableTemplating !== undefined ? this.properties.enableTemplating : true
      });

      // Process the message
      const result = await this.promptGenerator.processMessage(message);

      // Update outputs with processed message
      this.setOutputData(3, result); // processedMessage
      this.setOutputData(4, true); // success
      this.setOutputData(5, null); // error

      // Trigger completion event
      this.triggerSlot(0, null, null); // onProcessed

    } catch (error) {
      const errorMessage = `Error: Failed to process message - ${error instanceof Error ? error.message : 'Unknown error'}`;
      this.setOutputData(4, false); // success
      this.setOutputData(5, errorMessage); // error
      this.triggerSlot(1, null, null); // onError
      console.error('InitialPromptGeneratorNode error:', error);
    }
  }
}