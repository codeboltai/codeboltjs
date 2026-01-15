import { BaseListJobsNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class ListJobsNode extends BaseListJobsNode {
    constructor() { super(); }

    async onExecute() {
        try {
            const status = this.getInputData(1) as string;
            const groupId = this.getInputData(2) as string;
            const priority = this.getInputData(3) as string;
            const result = await codebolt.job.listJobs({ status, groupId, priority } as any);
            this.setOutputData(1, (result as any).jobs);
            this.setOutputData(2, (result as any).success);
            this.triggerSlot(0, null, null);
        } catch (error) {
            console.error('ListJobsNode error:', error);
            this.setOutputData(2, false);
        }
    }
}
