import { BaseGetPheromonesNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class GetPheromonesNode extends BaseGetPheromonesNode {
    constructor() { super(); }

    async onExecute() {
        try {
            const jobId = this.getInputData(1) as string;
            const result = await codebolt.job.getPheromones(jobId);
            this.setOutputData(1, (result as any).pheromones);
            this.setOutputData(2, (result as any).success);
            this.triggerSlot(0, null, null);
        } catch (error) {
            console.error('GetPheromonesNode error:', error);
            this.setOutputData(2, false);
        }
    }
}
