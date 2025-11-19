import { BaseChatCompressionModifierNode } from '@codebolt/agent-shared-nodes';
import { ChatCompressionModifier } from '@codebolt/agent/processor-pieces';

// Backend Chat Compression Modifier Node - actual implementation
export class ChatCompressionModifierNode extends BaseChatCompressionModifierNode {
  private modifier: ChatCompressionModifier;

  constructor() {
    super();
    this.modifier = new ChatCompressionModifier(this.getChatCompressionConfig() as any);
  }

  async onExecute() {
    const message = this.getInputData(0) as any;
    const customThreshold = this.getInputData(1) as number; // Optional custom threshold

    if (!message) {
      console.error('ChatCompressionModifierNode: No message input provided');
      this.setOutputData(1, false);
      return;
    }

    try {
      // Update modifier configuration with current node properties and custom threshold
      const config = this.getChatCompressionConfig();
      if (customThreshold) {
        config.tokenThreshold = customThreshold;
      }
      this.modifier = new ChatCompressionModifier(config as any);

      // Create a processed message object
      const processedMessage = {
        ...message,
        messages: message.messages || []
      };

      // Apply the modifier
      const result = await this.modifier.modify(message, processedMessage);

      // Calculate compression statistics
      const { compressionStats, compressionRatio } = this.calculateCompressionStats(message, result);

      // Set outputs
      this.setOutputData(0, result);
      this.setOutputData(1, true);
      this.setOutputData(2, compressionStats);
      this.setOutputData(3, compressionRatio);

      // Trigger completion
      this.triggerSlot(0, null, null);

    } catch (error) {
      console.error('ChatCompressionModifierNode: Error compressing message:', error);
      this.setOutputData(0, message); // Return original message on error
      this.setOutputData(1, false);
      this.setOutputData(2, null);
      this.setOutputData(3, 1.0); // No compression
    }
  }

  // Calculate compression statistics
  private calculateCompressionStats(originalMessage: any, compressedMessage: any): { compressionStats: any; compressionRatio: number } {
    try {
      const originalMessages = originalMessage.messages || [];
      const compressedMessages = compressedMessage.messages || [];

      const originalLength = JSON.stringify(originalMessages).length;
      const compressedLength = JSON.stringify(compressedMessages).length;
      const compressionRatio = originalLength > 0 ? compressedLength / originalLength : 1.0;

      return {
        compressionStats: {
          originalMessageCount: originalMessages.length,
          compressedMessageCount: compressedMessages.length,
          originalSize: originalLength,
          compressedSize: compressedLength,
          compressionRatio: compressionRatio,
          tokenThreshold: this.properties.tokenThreshold,
          compressionStrategy: this.properties.compressionStrategy,
          preserveRecentMessages: this.properties.preserveRecentMessages,
          timestamp: new Date().toISOString()
        },
        compressionRatio: compressionRatio
      };

    } catch (error) {
      console.error('Error calculating compression stats:', error);
      return {
        compressionStats: {
          error: 'Failed to calculate compression statistics',
          timestamp: new Date().toISOString()
        },
        compressionRatio: 1.0
      };
    }
  }
}