import { BaseListBidsNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class ListBidsNode extends BaseListBidsNode {
    constructor() { super(); }

    async onExecute() {
        try {
            const jobId = this.getInputData(1) as string;
            const result = await codebolt.job.listBids(jobId);
            this.setOutputData(1, (result as any).bids);
            this.setOutputData(2, (result as any).success);
            this.triggerSlot(0, null, null);
        } catch (error) {
            console.error('ListBidsNode error:', error);
            this.setOutputData(2, false);
        }
    }
}
