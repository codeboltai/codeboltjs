import { BaseAcceptBidNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class AcceptBidNode extends BaseAcceptBidNode {
    constructor() { super(); }

    async onExecute() {
        try {
            const jobId = this.getInputData(1) as string;
            const bidId = this.getInputData(2) as string;
            const result = await codebolt.job.acceptBid(jobId, bidId);
            this.setOutputData(1, (result as any).success);
            this.triggerSlot(0, null, null);
        } catch (error) {
            console.error('AcceptBidNode error:', error);
            this.setOutputData(1, false);
        }
    }
}
