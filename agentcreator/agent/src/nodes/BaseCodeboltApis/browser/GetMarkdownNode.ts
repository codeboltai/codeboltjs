import { BaseGetMarkdownNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class GetMarkdownNode extends BaseGetMarkdownNode {
    constructor() { super(); }

    async onExecute() {
        try {
            const result = await codebolt.browser.getMarkdown();
            this.setOutputData(1, (result as any).markdown);
            this.setOutputData(2, true);
            this.triggerSlot(0, null, null);
        } catch (error) {
            console.error('GetMarkdownNode error:', error);
            this.setOutputData(2, false);
        }
    }
}
