import { BaseEnterNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class EnterNode extends BaseEnterNode {
    constructor() { super(); }

    async onExecute() {
        try {
            const result = await codebolt.browser.enter();
            this.setOutputData(1, (result as any).success ?? true);
            this.triggerSlot(0, null, null);
        } catch (error) {
            console.error('EnterNode error:', error);
            this.setOutputData(1, false);
        }
    }
}
