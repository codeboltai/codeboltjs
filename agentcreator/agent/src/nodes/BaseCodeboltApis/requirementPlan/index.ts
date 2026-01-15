import { BaseCreateRequirementPlanNode, BaseGetRequirementPlanNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class CreateRequirementPlanNode extends BaseCreateRequirementPlanNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const fileName = this.getInputData(1) as string;
            const result = await codebolt.requirementPlan.create(fileName);
            this.setOutputData(1, (result as any)?.planId || result);
            this.setOutputData(2, true);
            this.triggerSlot(0, null, null);
        } catch (error) { console.error('CreateRequirementPlanNode error:', error); this.setOutputData(2, false); }
    }
}

export class GetRequirementPlanNode extends BaseGetRequirementPlanNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const filePath = this.getInputData(1) as string;
            const result = await codebolt.requirementPlan.get(filePath);
            this.setOutputData(1, result);
            this.setOutputData(2, true);
            this.triggerSlot(0, null, null);
        } catch (error) { console.error('GetRequirementPlanNode error:', error); this.setOutputData(2, false); }
    }
}
