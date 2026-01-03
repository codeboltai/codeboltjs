import { BaseScrollNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class ScrollNode extends BaseScrollNode {
    constructor() { super(); }

    async onExecute() {
        try {
            const direction = this.getInputData(1) as string;
            const pixels = this.getInputData(2) as string;
            const result = await codebolt.browser.scroll(direction, pixels);
            this.setOutputData(1, (result as any).success ?? true);
            this.triggerSlot(0, null, null);
        } catch (error) {
            console.error('ScrollNode error:', error);
            this.setOutputData(1, false);
        }
    }
}
