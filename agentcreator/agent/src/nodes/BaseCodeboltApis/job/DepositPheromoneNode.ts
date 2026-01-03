import { BaseDepositPheromoneNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class DepositPheromoneNode extends BaseDepositPheromoneNode {
    constructor() { super(); }

    async onExecute() {
        try {
            const jobId = this.getInputData(1) as string;
            const type = this.getInputData(2) as string;
            const intensity = this.getInputData(3) as number;
            const expiration = this.getInputData(4) as number;
            const result = await codebolt.job.depositPheromone(jobId, { type, intensity, expiration } as any);
            this.setOutputData(1, (result as any).pheromone);
            this.setOutputData(2, (result as any).success);
            this.triggerSlot(0, null, null);
        } catch (error) {
            console.error('DepositPheromoneNode error:', error);
            this.setOutputData(2, false);
        }
    }
}
