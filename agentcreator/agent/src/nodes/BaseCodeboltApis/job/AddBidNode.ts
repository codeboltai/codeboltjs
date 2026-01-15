import { BaseAddBidNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class AddBidNode extends BaseAddBidNode {
    constructor() { super(); }

    async onExecute() {
        try {
            const jobId = this.getInputData(1) as string;
            const agentId = this.getInputData(2) as string;
            const agentName = this.getInputData(3) as string;
            const amount = this.getInputData(4) as number;
            const result = await codebolt.job.addBid(jobId, { agentId, agentName, amount } as any);
            this.setOutputData(1, (result as any).bid);
            this.setOutputData(2, (result as any).success);
            this.triggerSlot(0, null, null);
        } catch (error) {
            console.error('AddBidNode error:', error);
            this.setOutputData(2, false);
        }
    }
}
