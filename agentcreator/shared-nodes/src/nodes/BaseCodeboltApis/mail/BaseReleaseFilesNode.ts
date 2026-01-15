import { LiteGraph } from '@codebolt/litegraph';
import { BaseMailServiceNode } from './BaseMailServiceNode';
import { NodeMetadata } from '../../../types';

export class BaseReleaseFilesNode extends BaseMailServiceNode {
    static metadata: NodeMetadata = {
        type: "codebolt/mail/releaseFiles",
        title: "Release Files",
        category: "codebolt/mail",
        description: "Release reserved files",
        icon: "🔓",
        color: "#FF9800"
    };

    constructor() {
        super(BaseReleaseFilesNode.metadata.title, BaseReleaseFilesNode.metadata.type);
        this.addInput("agentId", "string");
        this.addInput("paths", "array");

        this.addOutput("released", "boolean");
        this.addOutput("success", "boolean");
        this.addOutput("error", "string");
    }
}
