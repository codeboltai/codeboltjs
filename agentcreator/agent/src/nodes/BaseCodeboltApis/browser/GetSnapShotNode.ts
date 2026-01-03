import { BaseGetSnapShotNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class GetSnapShotNode extends BaseGetSnapShotNode {
    constructor() { super(); }

    async onExecute() {
        try {
            const result = await codebolt.browser.getSnapShot();
            this.setOutputData(1, (result as any).snapshot);
            this.setOutputData(2, true);
            this.triggerSlot(0, null, null);
        } catch (error) {
            console.error('GetSnapShotNode error:', error);
            this.setOutputData(2, false);
        }
    }
}
