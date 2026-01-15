import { BaseGetRoadmapNode, BaseAddMilestoneNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class GetRoadmapNode extends BaseGetRoadmapNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const result = await codebolt.roadmap.getRoadmap();
            this.setOutputData(1, (result as any)?.roadmap || result);
            this.setOutputData(2, true);
            this.triggerSlot(0, null, null);
        } catch (error) { console.error('GetRoadmapNode error:', error); this.setOutputData(2, false); }
    }
}

export class AddMilestoneNode extends BaseAddMilestoneNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const milestone = this.getInputData(1) as any;
            // Use createPhase instead of addMilestone (roadmap uses phases/features structure)
            const result = await codebolt.roadmap.createPhase(milestone);
            this.setOutputData(1, (result as any)?.phaseId || result);
            this.setOutputData(2, true);
            this.triggerSlot(0, null, null);
        } catch (error) { console.error('AddMilestoneNode error:', error); this.setOutputData(2, false); }
    }
}
