import { BaseExecuteActionBlockNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';
export class ExecuteActionBlockNode extends BaseExecuteActionBlockNode {
    constructor() { super(); }
    async onExecute() { try { const block = this.getInputData(1); const result = await (codebolt as any).actionBlock?.execute?.(block); this.setOutputData(1, result); this.setOutputData(2, true); this.triggerSlot(0, null, null); } catch (error) { console.error('ExecuteActionBlockNode error:', error); this.setOutputData(2, false); } }
}
