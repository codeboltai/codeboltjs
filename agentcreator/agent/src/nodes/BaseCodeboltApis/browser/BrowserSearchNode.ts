import { BaseBrowserSearchNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class BrowserSearchNode extends BaseBrowserSearchNode {
    constructor() { super(); }

    async onExecute() {
        try {
            const elementId = this.getInputData(1) as string;
            const query = this.getInputData(2) as string;
            const result = await codebolt.browser.search(elementId, query);
            this.setOutputData(1, result);
            this.setOutputData(2, true);
            this.triggerSlot(0, null, null);
        } catch (error) {
            console.error('BrowserSearchNode error:', error);
            this.setOutputData(2, false);
        }
    }
}
