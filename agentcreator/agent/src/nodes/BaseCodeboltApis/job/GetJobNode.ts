import { BaseGetJobNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class GetJobNode extends BaseGetJobNode {
    constructor() { super(); }

    async onExecute() {
        try {
            const jobId = this.getInputData(1) as string;
            const result = await codebolt.job.getJob(jobId);
            this.setOutputData(1, (result as any).job);
            this.setOutputData(2, (result as any).success);
            this.triggerSlot(0, null, null);
        } catch (error) {
            console.error('GetJobNode error:', error);
            this.setOutputData(2, false);
        }
    }
}
