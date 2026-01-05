import { BaseGetProjectMetadataNode, BaseGetPackagesNode, BaseCreatePackageNode, BaseUpdatePackageNode, BaseDeletePackageNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class GetProjectMetadataNode extends BaseGetProjectMetadataNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const result = await codebolt.projectStructure.getMetadata();
            this.setOutputData(1, (result as any).metadata || result);
            this.setOutputData(2, true);
            this.triggerSlot(0, null, null);
        } catch (error) { console.error('GetProjectMetadataNode error:', error); this.setOutputData(2, false); }
    }
}

export class GetPackagesNode extends BaseGetPackagesNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const result = await codebolt.projectStructure.getPackages();
            this.setOutputData(1, (result as any).packages || result);
            this.setOutputData(2, true);
            this.triggerSlot(0, null, null);
        } catch (error) { console.error('GetPackagesNode error:', error); this.setOutputData(2, false); }
    }
}

export class CreatePackageNode extends BaseCreatePackageNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const data = this.getInputData(1) as any;
            const result = await codebolt.projectStructure.createPackage(data);
            this.setOutputData(1, (result as any).package || result);
            this.setOutputData(2, true);
            this.triggerSlot(0, null, null);
        } catch (error) { console.error('CreatePackageNode error:', error); this.setOutputData(2, false); }
    }
}

export class UpdatePackageNode extends BaseUpdatePackageNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const packageId = this.getInputData(1) as string;
            const updates = this.getInputData(2) as any;
            const result = await codebolt.projectStructure.updatePackage(packageId, updates);
            this.setOutputData(1, (result as any).package || result);
            this.setOutputData(2, true);
            this.triggerSlot(0, null, null);
        } catch (error) { console.error('UpdatePackageNode error:', error); this.setOutputData(2, false); }
    }
}

export class DeletePackageNode extends BaseDeletePackageNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const packageId = this.getInputData(1) as string;
            await codebolt.projectStructure.deletePackage(packageId);
            this.setOutputData(1, true);
            this.triggerSlot(0, null, null);
        } catch (error) { console.error('DeletePackageNode error:', error); this.setOutputData(1, false); }
    }
}
