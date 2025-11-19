import { BaseEnvironmentContextModifierNode } from '@codebolt/agent-shared-nodes';
import { EnvironmentContextModifier } from '@codebolt/agent/processor-pieces';

// Backend Environment Context Modifier Node - actual implementation
export class EnvironmentContextModifierNode extends BaseEnvironmentContextModifierNode {
  private modifier: EnvironmentContextModifier;

  constructor() {
    super();
    this.modifier = new EnvironmentContextModifier(this.getEnvironmentContextConfig());
  }

  async onExecute() {
    const message = this.getInputData(0) as any;

    if (!message) {
      console.error('EnvironmentContextModifierNode: No message input provided');
      this.setOutputData(1, false);
      return;
    }

    try {
      // Update modifier configuration with current node properties
      this.modifier = new EnvironmentContextModifier(this.getEnvironmentContextConfig());

      // Create a processed message object (simplified for this example)
      const processedMessage = {
        ...message,
        messages: message.messages || []
      };

      // Apply the modifier
      const result = await this.modifier.modify(message, processedMessage);

      // Set outputs
      this.setOutputData(0, result);
      this.setOutputData(1, true);

      // Try to extract environment context from the result for the additional output
      const environmentContext = this.extractEnvironmentContext(result);
      this.setOutputData(2, environmentContext);

      // Trigger completion
      this.triggerSlot(0, null, null);

    } catch (error) {
      console.error('EnvironmentContextModifierNode: Error processing message:', error);
      this.setOutputData(0, message); // Return original message on error
      this.setOutputData(1, false);
      this.setOutputData(2, null);
    }
  }

  // Extract environment context from the processed message
  private extractEnvironmentContext(result: any): any {
    try {
      // Try to find environment context information in the processed messages
      const messages = result.messages || [];
      const envContextMessage = messages.find((msg: any) =>
        msg.role === 'system' && msg.content &&
        (msg.content.includes('System:') || msg.content.includes('Environment:'))
      );

      if (envContextMessage) {
        return {
          os: process.platform,
          nodeVersion: process.version,
          timestamp: new Date().toISOString(),
          content: envContextMessage.content
        };
      }

      // Fallback context
      return {
        os: process.platform,
        nodeVersion: process.version,
        timestamp: new Date().toISOString(),
        content: 'Environment context processed successfully'
      };

    } catch (error) {
      console.error('Error extracting environment context:', error);
      return {
        os: process.platform,
        nodeVersion: process.version,
        timestamp: new Date().toISOString(),
        error: 'Failed to extract context details'
      };
    }
  }
}