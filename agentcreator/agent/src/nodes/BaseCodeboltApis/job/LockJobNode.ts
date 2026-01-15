import { BaseLockJobNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class LockJobNode extends BaseLockJobNode {
    constructor() { super(); }

    async onExecute() {
        try {
            const jobId = this.getInputData(1) as string;
            const agentId = this.getInputData(2) as string;
            const agentName = this.getInputData(3) as string;
            const result = await codebolt.job.lockJob(jobId, agentId, agentName);
            this.setOutputData(1, (result as any).lock);
            this.setOutputData(2, (result as any).success);
            this.triggerSlot(0, null, null);
        } catch (error) {
            console.error('LockJobNode error:', error);
            this.setOutputData(2, false);
        }
    }
}
