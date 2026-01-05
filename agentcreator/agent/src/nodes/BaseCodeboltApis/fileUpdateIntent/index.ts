import { BaseCreateFileUpdateIntentNode, BaseListFileUpdateIntentsNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class CreateFileUpdateIntentNode extends BaseCreateFileUpdateIntentNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const files = this.getInputData(1) as string[];
            const description = this.getInputData(2) as string;
            const claimedBy = 'agent'; // Default agent identifier
            const result = await codebolt.fileUpdateIntent.create(
                { filePaths: files, description, priority: 5, environmentId: '' } as any,
                claimedBy
            );
            this.setOutputData(1, (result as any)?.intent?.id || result);
            this.setOutputData(2, true);
            this.triggerSlot(0, null, null);
        } catch (error) { console.error('CreateFileUpdateIntentNode error:', error); this.setOutputData(2, false); }
    }
}

export class ListFileUpdateIntentsNode extends BaseListFileUpdateIntentsNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const result = await codebolt.fileUpdateIntent.list();
            this.setOutputData(1, result || []);
            this.setOutputData(2, true);
            this.triggerSlot(0, null, null);
        } catch (error) { console.error('ListFileUpdateIntentsNode error:', error); this.setOutputData(2, false); }
    }
}
