import { BaseDelayNode } from '@codebolt/agent-shared-nodes';

// Backend-specific Delay Node - execution logic only
export class DelayNode extends BaseDelayNode {
  private activeDelays: Map<string, { startTime: number; data: any }> = new Map();

  constructor() {
    super();
    // Backend doesn't need UI widgets
  }

  // Backend execution logic
  async onExecute() {
    const delay = this.getInputData(2) ?? (this.properties.delay as number);
    const data = this.getInputData(1);
    const isAsync = this.properties.async as boolean;

    // Validate delay
    const validatedDelay = this.validateDelay(delay);

    if (isAsync) {
      // Asynchronous delay
      try {
        const nodeId = String(this.id);
        this.activeDelays.set(nodeId, { startTime: Date.now(), data });

        await this.executeDelay(validatedDelay, data);

        // Update outputs and trigger completion
        this.setOutputData(0, data);
        this.setOutputData(1, data);
        this.triggerSlot(0, null, null); // onComplete

        // Clean up
        this.activeDelays.delete(nodeId);

        // console.log(`DelayNode ${this.id}: completed async ${validatedDelay}ms delay`);
      } catch (error) {
        // console.error(`DelayNode ${this.id}: async delay failed:`, error);
        this.activeDelays.delete(String(this.id));
      }
    } else {
      // Synchronous delay (for non-real-time execution)
      this.setOutputData(0, data);
      this.setOutputData(1, data);
      this.triggerSlot(0, null, null); // onComplete

      // console.log(`DelayNode ${this.id}: synchronous delay ${validatedDelay}ms (simulated)`);
    }
  }

  // Get active delay info
  getActiveDelays(): Array<{ nodeId: string; startTime: number; elapsedTime: number }> {
    const now = Date.now();
    return Array.from(this.activeDelays.entries()).map(([nodeId, info]) => ({
      nodeId,
      startTime: info.startTime,
      elapsedTime: now - info.startTime
    }));
  }

  // Cancel all active delays
  cancelActiveDelays() {
    this.activeDelays.clear();
  }
}