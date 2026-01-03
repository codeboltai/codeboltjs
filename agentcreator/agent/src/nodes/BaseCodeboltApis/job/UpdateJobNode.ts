import { BaseUpdateJobNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class UpdateJobNode extends BaseUpdateJobNode {
    constructor() { super(); }

    async onExecute() {
        try {
            const jobId = this.getInputData(1) as string;
            const name = this.getInputData(2) as string;
            const status = this.getInputData(3) as string;
            const priority = this.getInputData(4) as number;
            const result = await codebolt.job.updateJob(jobId, { name, status, priority } as any);
            this.setOutputData(1, (result as any).job);
            this.setOutputData(2, (result as any).success);
            this.triggerSlot(0, null, null);
        } catch (error) {
            console.error('UpdateJobNode error:', error);
            this.setOutputData(2, false);
        }
    }
}
