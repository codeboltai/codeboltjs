import { BaseStartSideExecutionNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';
export class StartSideExecutionNode extends BaseStartSideExecutionNode {
    constructor() { super(); }
    async onExecute() { try { const task = this.getInputData(1); const result = await (codebolt as any).sideExecution?.start?.(task); this.setOutputData(1, (result as any)?.executionId); this.setOutputData(2, true); this.triggerSlot(0, null, null); } catch (error) { console.error('StartSideExecutionNode error:', error); this.setOutputData(2, false); } }
}
