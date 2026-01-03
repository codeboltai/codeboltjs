import { BaseResolveBlockerNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class ResolveBlockerNode extends BaseResolveBlockerNode {
    constructor() { super(); }

    async onExecute() {
        try {
            const jobId = this.getInputData(1) as string;
            const blockerId = this.getInputData(2) as string;
            const resolvedBy = this.getInputData(3) as string;
            const result = await codebolt.job.resolveBlocker(jobId, blockerId, resolvedBy);
            this.setOutputData(1, (result as any).success);
            this.triggerSlot(0, null, null);
        } catch (error) {
            console.error('ResolveBlockerNode error:', error);
            this.setOutputData(1, false);
        }
    }
}
