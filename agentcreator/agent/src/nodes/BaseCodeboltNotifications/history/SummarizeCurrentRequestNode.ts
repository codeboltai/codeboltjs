import { BaseSummarizeCurrentRequestNode } from '@agent-creator/shared-nodes';
import { historyNotifications } from '@codebolt/codeboltjs';

// Backend-specific SummarizeCurrentRequest Node - actual implementation
export class SummarizeCurrentRequestNode extends BaseSummarizeCurrentRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const messagesInput = this.getInputData(1);
    const depth = this.getInputData(2);
    const toolUseId = this.getInputData(3);

    try {
      // Parse messages input - should be an array of message objects with role and content
      let messages;
      if (messagesInput) {
        if (typeof messagesInput === 'string') {
          try {
            messages = JSON.parse(messagesInput);
          } catch (error) {
            const errorMessage = 'Error: messages input must be valid JSON array';
            console.error('SummarizeCurrentRequestNode error:', errorMessage);
            this.setOutputData(1, false);
            return;
          }
        } else {
          messages = messagesInput;
        }
      } else {
        const errorMessage = 'Error: messages is required for summarize current request';
        console.error('SummarizeCurrentRequestNode error:', errorMessage);
        this.setOutputData(1, false);
        return;
      }

      // Validate messages structure
      if (!Array.isArray(messages) || messages.length === 0) {
        const errorMessage = 'Error: messages must be a non-empty array';
        console.error('SummarizeCurrentRequestNode error:', errorMessage);
        this.setOutputData(1, false);
        return;
      }

      // Validate each message has required role and content
      for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        if (!message.role || !message.content) {
          const errorMessage = `Error: Message at index ${i} must have 'role' and 'content' fields`;
          console.error('SummarizeCurrentRequestNode error:', errorMessage);
          this.setOutputData(1, false);
          return;
        }
      }

      // Validate depth
      const depthNumber = depth as number;
      if (depth === undefined || depth === null || depthNumber <= 0) {
        const errorMessage = 'Error: depth must be a positive number';
        console.error('SummarizeCurrentRequestNode error:', errorMessage);
        this.setOutputData(1, false);
        return;
      }

      // Create the data object for the notification
      const data = {
        messages: messages,
        depth: depthNumber
      };

      // Call the actual notification function
      historyNotifications.summarizeCurrentMessage(data, toolUseId as string);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send summarize current request`;
      this.setOutputData(1, false);
      console.error('SummarizeCurrentRequestNode error:', error);
    }
  }
}