import { BaseConversationCompactorNode } from '@codebolt/agent-shared-nodes';
import { ConversationCompactorModifier } from '@codebolt/agent/processor-pieces';

// Backend Conversation Compactor Node - actual implementation
export class ConversationCompactorNode extends BaseConversationCompactorNode {
  private modifier: ConversationCompactorModifier;

  constructor() {
    super();
    this.modifier = new ConversationCompactorModifier(this.getConversationCompactorConfig() as any);
  }

  async onExecute() {
    const message = this.getInputData(0) as any;
    const conversationHistory = this.getInputData(1) as any[]; // Optional conversation history

    if (!message) {
      console.error('ConversationCompactorNode: No message input provided');
      this.setOutputData(1, false);
      return;
    }

    try {
      // Update modifier configuration with current node properties
      this.modifier = new ConversationCompactorModifier(this.getConversationCompactorConfig() as any);

      // Create a processed message object
      let processedMessage = {
        ...message,
        messages: message.messages || []
      };

      // If conversation history is provided, merge it with existing messages
      if (conversationHistory && Array.isArray(conversationHistory)) {
        processedMessage.conversationHistory = conversationHistory;
        processedMessage.messages = [...conversationHistory, ...processedMessage.messages];
      }

      // Apply the modifier
      const result = await this.modifier.modify(processedMessage);

      // Extract compaction statistics and compacted conversation
      const { compactionConfig, compactionStats, compactedConversation } = this.extractCompactionResults(result, processedMessage);

      // Set outputs
      this.setOutputData(0, result);
      this.setOutputData(1, true);
      this.setOutputData(2, compactionConfig);
      this.setOutputData(3, compactionStats);
      this.setOutputData(4, compactedConversation);

      // Trigger completion
      this.triggerSlot(0, null, null);

    } catch (error) {
      console.error('ConversationCompactorNode: Error compacting conversation:', error);
      this.setOutputData(0, message); // Return original message on error
      this.setOutputData(1, false);
      this.setOutputData(2, null);
      this.setOutputData(3, null);
      this.setOutputData(4, []);
    }
  }

  // Extract compaction results from the processed message
  private extractCompactionResults(result: any, processedMessage: any): { compactionConfig: any; compactionStats: any; compactedConversation: any[] } {
    try {
      const originalMessages = processedMessage.messages || [];
      const compactedMessages = result.messages || [];

      const originalLength = JSON.stringify(originalMessages).length;
      const compactedLength = JSON.stringify(compactedMessages).length;
      const compressionRatio = originalLength > 0 ? compactedLength / originalLength : 1.0;

      const compactionConfig = this.getConversationCompactorConfig();
      compactionConfig.timestamp = new Date().toISOString();

      const compactionStats = {
        originalMessageCount: originalMessages.length,
        compactedMessageCount: compactedMessages.length,
        originalSize: originalLength,
        compactedSize: compactedLength,
        compressionRatio: compressionRatio,
        sizeReduction: 1 - compressionRatio,
        strategy: compactionConfig.compactionStrategy,
        preserveToolCalls: compactionConfig.preserveToolCalls,
        preserveErrors: compactionConfig.preserveErrors,
        summaryStyle: compactionConfig.summaryStyle,
        timestamp: new Date().toISOString()
      };

      return {
        compactionConfig: compactionConfig,
        compactionStats: compactionStats,
        compactedConversation: compactedMessages
      };

    } catch (error) {
      console.error('Error extracting compaction results:', error);
      return {
        compactionConfig: {
          error: 'Failed to extract compaction configuration',
          timestamp: new Date().toISOString()
        },
        compactionStats: {
          error: 'Failed to extract compaction statistics',
          timestamp: new Date().toISOString()
        },
        compactedConversation: []
      };
    }
  }
}