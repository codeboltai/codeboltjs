import { BaseNewPageNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class NewPageNode extends BaseNewPageNode {
    constructor() { super(); }

    async onExecute() {
        try {
            const result = await codebolt.browser.newPage();
            this.setOutputData(1, (result as any).success ?? true);
            this.triggerSlot(0, null, null);
        } catch (error) {
            console.error('NewPageNode error:', error);
            this.setOutputData(1, false);
        }
    }
}
