import { BaseGetCodemapNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class GetCodemapNode extends BaseGetCodemapNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const result = await (codebolt as any).codemap?.getCodemap?.() || {};
            this.setOutputData(1, result);
            this.setOutputData(2, true);
            this.triggerSlot(0, null, null);
        } catch (error) { console.error('GetCodemapNode error:', error); this.setOutputData(2, false); }
    }
}
