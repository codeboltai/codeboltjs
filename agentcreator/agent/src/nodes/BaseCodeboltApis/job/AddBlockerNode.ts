import { BaseAddBlockerNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class AddBlockerNode extends BaseAddBlockerNode {
    constructor() { super(); }

    async onExecute() {
        try {
            const jobId = this.getInputData(1) as string;
            const type = this.getInputData(2) as string;
            const description = this.getInputData(3) as string;
            const blockedBy = this.getInputData(4) as string;
            const result = await codebolt.job.addBlocker(jobId, { type, description, blockedBy } as any);
            this.setOutputData(1, (result as any).blocker);
            this.setOutputData(2, (result as any).success);
            this.triggerSlot(0, null, null);
        } catch (error) {
            console.error('AddBlockerNode error:', error);
            this.setOutputData(2, false);
        }
    }
}
