import { BaseGoToPageNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class GoToPageNode extends BaseGoToPageNode {
    constructor() { super(); }

    async onExecute() {
        try {
            const url = this.getInputData(1) as string;
            const result = await codebolt.browser.goToPage(url);
            this.setOutputData(1, (result as any).success ?? true);
            this.triggerSlot(0, null, null);
        } catch (error) {
            console.error('GoToPageNode error:', error);
            this.setOutputData(1, false);
        }
    }
}
