import { BaseGetHTMLNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class GetHTMLNode extends BaseGetHTMLNode {
    constructor() { super(); }

    async onExecute() {
        try {
            const result = await codebolt.browser.getHTML();
            this.setOutputData(1, (result as any).html);
            this.setOutputData(2, true);
            this.triggerSlot(0, null, null);
        } catch (error) {
            console.error('GetHTMLNode error:', error);
            this.setOutputData(2, false);
        }
    }
}
