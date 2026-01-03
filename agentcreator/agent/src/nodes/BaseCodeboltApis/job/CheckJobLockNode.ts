import { BaseCheckJobLockNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class CheckJobLockNode extends BaseCheckJobLockNode {
    constructor() { super(); }

    async onExecute() {
        try {
            const jobId = this.getInputData(1) as string;
            const result = await codebolt.job.isJobLocked(jobId);
            this.setOutputData(1, (result as any).isLocked);
            this.setOutputData(2, (result as any).lock);
            this.setOutputData(3, (result as any).success);
            this.triggerSlot(0, null, null);
        } catch (error) {
            console.error('CheckJobLockNode error:', error);
            this.setOutputData(3, false);
        }
    }
}
