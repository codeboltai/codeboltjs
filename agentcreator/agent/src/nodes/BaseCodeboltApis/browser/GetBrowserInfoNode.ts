import { BaseGetBrowserInfoNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class GetBrowserInfoNode extends BaseGetBrowserInfoNode {
    constructor() { super(); }

    async onExecute() {
        try {
            const result = await codebolt.browser.getBrowserInfo();
            this.setOutputData(1, result);
            this.setOutputData(2, true);
            this.triggerSlot(0, null, null);
        } catch (error) {
            console.error('GetBrowserInfoNode error:', error);
            this.setOutputData(2, false);
        }
    }
}
