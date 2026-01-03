import { BaseSearchJobsByPheromoneNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class SearchJobsByPheromoneNode extends BaseSearchJobsByPheromoneNode {
    constructor() { super(); }

    async onExecute() {
        try {
            const type = this.getInputData(1) as string;
            const minIntensity = this.getInputData(2) as number;
            const result = await codebolt.job.listJobsByPheromone(type, minIntensity);
            this.setOutputData(1, (result as any).jobs);
            this.setOutputData(2, (result as any).success);
            this.triggerSlot(0, null, null);
        } catch (error) {
            console.error('SearchJobsByPheromoneNode error:', error);
            this.setOutputData(2, false);
        }
    }
}
