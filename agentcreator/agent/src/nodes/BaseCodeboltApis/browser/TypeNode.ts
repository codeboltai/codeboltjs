import { BaseTypeNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class TypeNode extends BaseTypeNode {
    constructor() { super(); }

    async onExecute() {
        try {
            const elementId = this.getInputData(1) as string;
            const text = this.getInputData(2) as string;
            const result = await codebolt.browser.type(elementId, text);
            this.setOutputData(1, (result as any).success ?? true);
            this.triggerSlot(0, null, null);
        } catch (error) {
            console.error('TypeNode error:', error);
            this.setOutputData(1, false);
        }
    }
}
