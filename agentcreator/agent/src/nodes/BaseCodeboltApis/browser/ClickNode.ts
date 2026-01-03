import { BaseClickNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class ClickNode extends BaseClickNode {
    constructor() { super(); }

    async onExecute() {
        try {
            const elementId = this.getInputData(1) as string;
            const result = await codebolt.browser.click(elementId);
            this.setOutputData(1, (result as any).success ?? true);
            this.triggerSlot(0, null, null);
        } catch (error) {
            console.error('ClickNode error:', error);
            this.setOutputData(1, false);
        }
    }
}
