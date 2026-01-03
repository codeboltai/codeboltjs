import { BaseGetUrlNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class GetUrlNode extends BaseGetUrlNode {
    constructor() { super(); }

    async onExecute() {
        try {
            const result = await codebolt.browser.getUrl();
            this.setOutputData(1, (result as any).url);
            this.setOutputData(2, true);
            this.triggerSlot(0, null, null);
        } catch (error) {
            console.error('GetUrlNode error:', error);
            this.setOutputData(2, false);
        }
    }
}
