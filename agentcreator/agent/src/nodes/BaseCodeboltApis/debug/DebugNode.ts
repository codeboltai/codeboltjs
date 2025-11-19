import { BaseDebugNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { logType } from '@codebolt/codeboltjs';

// Backend-specific Debug Node - actual implementation
export class DebugNode extends BaseDebugNode {
  constructor() {
    super();
  }

  async onExecute() {
    const log = this.getInputData(1);
    const type = this.getInputData(2) || this.properties.type || "info";

    if (!log || typeof log !== 'string' || !log.trim()) {
      const errorMessage = 'Error: Log message cannot be empty';
      console.error('DebugNode error:', errorMessage);
      this.setOutputData(2, false);
      this.setOutputData(1, null);
      return;
    }

    // Validate log type
    if (!Object.values(logType).includes(type as logType)) {
      const errorMessage = `Error: Invalid log type "${type}". Must be one of: ${Object.values(logType).join(', ')}`;
      console.error('DebugNode error:', errorMessage);
      this.setOutputData(2, false);
      this.setOutputData(1, null);
      return;
    }

    try {
      const result = await codebolt.debug.debug(log, type as logType);

      // Update outputs with success results
      this.setOutputData(1, result);
      this.setOutputData(2, true);

      // Trigger the logSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error sending debug log: ${error}`;
      this.setOutputData(1, null);
      this.setOutputData(2, false);
      console.error('DebugNode error:', error);
    }
  }
}