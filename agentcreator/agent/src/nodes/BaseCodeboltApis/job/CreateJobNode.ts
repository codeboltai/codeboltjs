import { BaseCreateJobNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class CreateJobNode extends BaseCreateJobNode {
    constructor() { super(); }

    async onExecute() {
        try {
            const groupId = this.getInputData(1) as string;
            const name = this.getInputData(2) as string;
            const type = this.getInputData(3) as string;
            const priority = this.getInputData(4) as number;
            const description = this.getInputData(5) as string;

            const result = await codebolt.job.createJob(groupId, { name, type, priority, description } as any);
            this.setOutputData(1, (result as any).job);
            this.setOutputData(2, (result as any).success);
            this.triggerSlot(0, null, null);
        } catch (error) {
            console.error('CreateJobNode error:', error);
            this.setOutputData(2, false);
        }
    }
}
