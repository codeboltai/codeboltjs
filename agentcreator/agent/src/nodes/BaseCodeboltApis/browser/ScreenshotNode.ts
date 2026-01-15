import { BaseScreenshotNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class ScreenshotNode extends BaseScreenshotNode {
    constructor() { super(); }

    async onExecute() {
        try {
            const result = await codebolt.browser.screenshot();
            this.setOutputData(1, (result as any).screenshot || (result as any).data);
            this.setOutputData(2, true);
            this.triggerSlot(0, null, null);
        } catch (error) {
            console.error('ScreenshotNode error:', error);
            this.setOutputData(2, false);
        }
    }
}
