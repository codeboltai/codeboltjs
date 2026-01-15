import { BaseCloseNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class CloseNode extends BaseCloseNode {
    constructor() { super(); }

    async onExecute() {
        try {
            codebolt.browser.close();
            this.setOutputData(1, true);
            this.triggerSlot(0, null, null);
        } catch (error) {
            console.error('CloseNode error:', error);
            this.setOutputData(1, false);
        }
    }
}
