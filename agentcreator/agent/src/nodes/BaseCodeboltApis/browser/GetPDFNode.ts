import { BaseGetPDFNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class GetPDFNode extends BaseGetPDFNode {
    constructor() { super(); }

    async onExecute() {
        try {
            codebolt.browser.getPDF();
            this.setOutputData(1, true);
            this.triggerSlot(0, null, null);
        } catch (error) {
            console.error('GetPDFNode error:', error);
            this.setOutputData(1, false);
        }
    }
}
