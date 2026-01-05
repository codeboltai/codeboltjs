import { BaseSaveToDbMemoryNode, BaseGetFromDbMemoryNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class SaveToDbMemoryNode extends BaseSaveToDbMemoryNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const key = this.getInputData(1) as string;
            const value = this.getInputData(2);
            await (codebolt as any).dbmemory?.save?.(key, value);
            this.setOutputData(1, true);
            this.triggerSlot(0, null, null);
        } catch (error) { console.error('SaveToDbMemoryNode error:', error); this.setOutputData(1, false); }
    }
}

export class GetFromDbMemoryNode extends BaseGetFromDbMemoryNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const key = this.getInputData(1) as string;
            const result = await (codebolt as any).dbmemory?.get?.(key);
            this.setOutputData(1, result);
            this.setOutputData(2, true);
            this.triggerSlot(0, null, null);
        } catch (error) { console.error('GetFromDbMemoryNode error:', error); this.setOutputData(2, false); }
    }
}
