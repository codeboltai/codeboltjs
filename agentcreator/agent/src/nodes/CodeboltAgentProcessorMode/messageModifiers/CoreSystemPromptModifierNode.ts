import { BaseCoreSystemPromptModifierNode } from '@codebolt/agent-shared-nodes';
import { CoreSystemPromptModifier } from '@codebolt/agent/processor-pieces';

// Backend Core System Prompt Modifier Node - actual implementation
export class CoreSystemPromptModifierNode extends BaseCoreSystemPromptModifierNode {
  private modifier: CoreSystemPromptModifier;

  constructor() {
    super();
    this.modifier = new CoreSystemPromptModifier(this.getCoreSystemPromptConfig());
  }

  async onExecute() {
    const message = this.getInputData(0) as any;

    if (!message) {
      console.error('CoreSystemPromptModifierNode: No message input provided');
      this.setOutputData(1, false);
      return;
    }

    try {
      // Update modifier configuration with current node properties
      this.modifier = new CoreSystemPromptModifier(this.getCoreSystemPromptConfig());

      // Create a processed message object
      const processedMessage = {
        ...message,
        messages: message.messages || []
      };

      // Apply the modifier
      const result = await this.modifier.modify(message, processedMessage);

      // Set outputs
      this.setOutputData(0, result);
      this.setOutputData(1, true);

      // Extract the system prompt that was added
      const systemPrompt = this.extractSystemPrompt(result);
      this.setOutputData(2, systemPrompt);

      // Trigger completion
      this.triggerSlot(0, null, null);

    } catch (error) {
      console.error('CoreSystemPromptModifierNode: Error processing message:', error);
      this.setOutputData(0, message); // Return original message on error
      this.setOutputData(1, false);
      this.setOutputData(2, null);
    }
  }

  // Extract the system prompt that was added to the conversation
  private extractSystemPrompt(result: any): string | null {
    try {
      const messages = result.messages || [];
      const systemMessage = messages.find((msg: any) => msg.role === 'system');

      if (systemMessage && systemMessage.content) {
        return systemMessage.content;
      }

      return null;

    } catch (error) {
      console.error('Error extracting system prompt:', error);
      return null;
    }
  }
}