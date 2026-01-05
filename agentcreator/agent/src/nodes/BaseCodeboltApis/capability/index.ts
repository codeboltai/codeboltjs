import { BaseListCapabilitiesNode, BaseRegisterCapabilityNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class ListCapabilitiesNode extends BaseListCapabilitiesNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const result = await (codebolt as any).capability?.listCapabilities?.() || { capabilities: [] };
            this.setOutputData(1, (result as any).capabilities || []);
            this.setOutputData(2, true);
            this.triggerSlot(0, null, null);
        } catch (error) { console.error('ListCapabilitiesNode error:', error); this.setOutputData(2, false); }
    }
}

export class RegisterCapabilityNode extends BaseRegisterCapabilityNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const capability = this.getInputData(1) as any;
            await (codebolt as any).capability?.registerCapability?.(capability);
            this.setOutputData(1, true);
            this.triggerSlot(0, null, null);
        } catch (error) { console.error('RegisterCapabilityNode error:', error); this.setOutputData(1, false); }
    }
}
