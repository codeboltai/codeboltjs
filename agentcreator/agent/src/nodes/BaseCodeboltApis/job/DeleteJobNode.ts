import { BaseDeleteJobNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class DeleteJobNode extends BaseDeleteJobNode {
    constructor() { super(); }

    async onExecute() {
        try {
            const jobId = this.getInputData(1) as string;
            const result = await codebolt.job.deleteJob(jobId);
            this.setOutputData(1, (result as any).success);
            this.triggerSlot(0, null, null);
        } catch (error) {
            console.error('DeleteJobNode error:', error);
            this.setOutputData(1, false);
        }
    }
}
