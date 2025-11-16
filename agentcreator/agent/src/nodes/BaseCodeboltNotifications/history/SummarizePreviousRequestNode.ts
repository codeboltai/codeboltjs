import { BaseSummarizePreviousRequestNode } from '@agent-creator/shared-nodes';
import { historyNotifications } from '@codebolt/codeboltjs';

// Backend-specific SummarizePreviousRequest Node - actual implementation
export class SummarizePreviousRequestNode extends BaseSummarizePreviousRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const data = this.getInputData(1);
    const toolUseId = this.getInputData(2);

    try {
      // Parse data input if it's a JSON string, otherwise use as object
      let parsedData = data;
      if (typeof data === 'string') {
        try {
          parsedData = JSON.parse(data);
        } catch (error) {
          console.error('SummarizePreviousRequestNode: Invalid JSON for data:', error);
          parsedData = {};
        }
      }

      // Call the actual notification function
      historyNotifications.summarizePreviousConversation(parsedData as string, toolUseId as string);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send summarize previous request`;
      this.setOutputData(1, false);
      console.error('SummarizePreviousRequestNode error:', error);
    }
  }
}