import { BaseCreateMergeRequestNode, BaseListMergeRequestsNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class CreateMergeRequestNode extends BaseCreateMergeRequestNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const request = this.getInputData(1) as any;
            const result = await codebolt.reviewMergeRequest.create(request);
            this.setOutputData(1, (result as any)?.mrId || result);
            this.setOutputData(2, true);
            this.triggerSlot(0, null, null);
        } catch (error) { console.error('CreateMergeRequestNode error:', error); this.setOutputData(2, false); }
    }
}

export class ListMergeRequestsNode extends BaseListMergeRequestsNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const result = await codebolt.reviewMergeRequest.list();
            this.setOutputData(1, (result as any)?.requests || []);
            this.setOutputData(2, true);
            this.triggerSlot(0, null, null);
        } catch (error) { console.error('ListMergeRequestsNode error:', error); this.setOutputData(2, false); }
    }
}
