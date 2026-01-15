import { BaseGetContentNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class GetContentNode extends BaseGetContentNode {
    constructor() { super(); }

    async onExecute() {
        try {
            const result = await codebolt.browser.getContent();
            this.setOutputData(1, (result as any).content);
            this.setOutputData(2, true);
            this.triggerSlot(0, null, null);
        } catch (error) {
            console.error('GetContentNode error:', error);
            this.setOutputData(2, false);
        }
    }
}
