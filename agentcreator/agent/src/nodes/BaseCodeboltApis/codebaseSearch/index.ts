import { BaseCodebaseSearchNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class CodebaseSearchNode extends BaseCodebaseSearchNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const query = this.getInputData(1) as string;
            const result = await (codebolt as any).codebaseSearch?.search?.(query) || { results: [] };
            this.setOutputData(1, (result as any).results || []);
            this.setOutputData(2, true);
            this.triggerSlot(0, null, null);
        } catch (error) { console.error('CodebaseSearchNode error:', error); this.setOutputData(2, false); }
    }
}
