import { BaseUnlockJobNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class UnlockJobNode extends BaseUnlockJobNode {
    constructor() { super(); }

    async onExecute() {
        try {
            const jobId = this.getInputData(1) as string;
            const agentId = this.getInputData(2) as string;
            const result = await codebolt.job.unlockJob(jobId, agentId);
            this.setOutputData(1, (result as any).success);
            this.triggerSlot(0, null, null);
        } catch (error) {
            console.error('UnlockJobNode error:', error);
            this.setOutputData(1, false);
        }
    }
}
