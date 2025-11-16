import { BaseChatHistoryMessageModifierNode } from '@agent-creator/shared-nodes';
import { ChatHistoryMessageModifier } from '@agent-creator/message-modifiers';

// Backend Chat History Message Modifier Node - actual implementation
export class ChatHistoryMessageModifierNode extends BaseChatHistoryMessageModifierNode {
  private modifier: ChatHistoryMessageModifier;

  constructor() {
    super();
    this.modifier = new ChatHistoryMessageModifier(this.getChatHistoryConfig());
  }

  async onExecute() {
    const message = this.getInputData(0) as any;
    const customThreadId = this.getInputData(1) as string; // Optional thread ID input

    if (!message) {
      console.error('ChatHistoryMessageModifierNode: No message input provided');
      this.setOutputData(2, false);
      return;
    }

    try {
      // Update configuration with current node properties and optional custom thread ID
      const config = this.getChatHistoryConfig();
      if (customThreadId) {
        config.threadId = customThreadId;
      }
      this.modifier = new ChatHistoryMessageModifier(config);

      // Create a processed message object
      const processedMessage = {
        ...message,
        messages: message.messages || []
      };

      // Apply the modifier
      const result = await this.modifier.modify(message, processedMessage);

      // Set outputs
      this.setOutputData(0, result);
      this.setOutputData(2, true);

      // Extract chat history information
      const { chatHistory, historyEntries } = this.extractChatHistoryInfo(result);
      this.setOutputData(3, chatHistory);
      this.setOutputData(4, historyEntries);

      // Trigger completion
      this.triggerSlot(0, null, null);

    } catch (error) {
      console.error('ChatHistoryMessageModifierNode: Error processing message:', error);
      this.setOutputData(0, message); // Return original message on error
      this.setOutputData(2, false);
      this.setOutputData(3, null);
      this.setOutputData(4, []);
    }
  }

  // Extract chat history information from the processed message
  private extractChatHistoryInfo(result: any): { chatHistory: any; historyEntries: any[] } {
    try {
      const messages = result.messages || [];
      const historyMessages = messages.filter((msg: any) =>
        msg.role !== 'system' || !msg.content.includes('Chat History:')
      );

      // Extract history entries from the processed messages
      const historyEntries = historyMessages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp || new Date().toISOString(),
        type: 'history'
      }));

      return {
        chatHistory: {
          threadId: this.properties.threadId || 'default',
          messageCount: historyEntries.length,
          includeSystemMessages: this.properties.includeSystemMessages,
          historyWindow: this.properties.historyWindow,
          maxHistoryMessages: this.properties.maxHistoryMessages,
          timestamp: new Date().toISOString(),
          entries: historyEntries
        },
        historyEntries: historyEntries
      };

    } catch (error) {
      console.error('Error extracting chat history info:', error);
      return {
        chatHistory: {
          threadId: this.properties.threadId || 'default',
          messageCount: 0,
          includeSystemMessages: this.properties.includeSystemMessages,
          historyWindow: this.properties.historyWindow,
          maxHistoryMessages: this.properties.maxHistoryMessages,
          timestamp: new Date().toISOString(),
          error: 'Failed to extract chat history'
        },
        historyEntries: []
      };
    }
  }
}