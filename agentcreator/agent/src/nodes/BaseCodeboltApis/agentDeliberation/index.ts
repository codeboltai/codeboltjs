import { BaseDeliberateNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';
export class DeliberateNode extends BaseDeliberateNode {
    constructor() { super(); }
    async onExecute() { try { const context = this.getInputData(1); const result = await (codebolt as any).agentDeliberation?.deliberate?.(context); this.setOutputData(1, result); this.setOutputData(2, true); this.triggerSlot(0, null, null); } catch (error) { console.error('DeliberateNode error:', error); this.setOutputData(2, false); } }
}
