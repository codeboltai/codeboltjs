import { BaseRunTestsNode, BaseGetTestResultsNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';
export class RunTestsNode extends BaseRunTestsNode {
    constructor() { super(); }
    async onExecute() { try { const config = this.getInputData(1); const result = await (codebolt as any).autoTesting?.runTests?.(config); this.setOutputData(1, result); this.setOutputData(2, true); this.triggerSlot(0, null, null); } catch (error) { console.error('RunTestsNode error:', error); this.setOutputData(2, false); } }
}
export class GetTestResultsNode extends BaseGetTestResultsNode {
    constructor() { super(); }
    async onExecute() { try { const testId = this.getInputData(1) as string; const result = await (codebolt as any).autoTesting?.getResults?.(testId); this.setOutputData(1, result); this.setOutputData(2, true); this.triggerSlot(0, null, null); } catch (error) { console.error('GetTestResultsNode error:', error); this.setOutputData(2, false); } }
}
