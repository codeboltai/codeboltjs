import { BaseTimeNode } from '@agent-creator/shared-nodes';

// Backend-specific Time Node - execution logic only
export class TimeNode extends BaseTimeNode {
  constructor() {
    super();
    // Backend doesn't need UI widgets
  }

  // Backend execution logic
  onExecute() {
    const time = this.getCurrentTime(this.graph);
    this.setOutputData(0, time.milliseconds);
    this.setOutputData(1, time.seconds);

    // console.log(`TimeNode ${this.id}: ${time.milliseconds}ms, ${time.seconds}s`);
  }
}