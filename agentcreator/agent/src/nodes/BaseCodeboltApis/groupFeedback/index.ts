import { BaseSubmitFeedbackNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';
export class SubmitFeedbackNode extends BaseSubmitFeedbackNode {
    constructor() { super(); }
    async onExecute() {
        try { const feedback = this.getInputData(1); await (codebolt as any).groupFeedback?.submit?.(feedback); this.setOutputData(1, true); this.triggerSlot(0, null, null); }
        catch (error) { console.error('SubmitFeedbackNode error:', error); this.setOutputData(1, false); }
    }
}
