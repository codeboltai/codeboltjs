import { BaseExtractTextNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class ExtractTextNode extends BaseExtractTextNode {
    constructor() { super(); }

    async onExecute() {
        try {
            const result = await codebolt.browser.extractText();
            this.setOutputData(1, (result as any).text);
            this.setOutputData(2, true);
            this.triggerSlot(0, null, null);
        } catch (error) {
            console.error('ExtractTextNode error:', error);
            this.setOutputData(2, false);
        }
    }
}
