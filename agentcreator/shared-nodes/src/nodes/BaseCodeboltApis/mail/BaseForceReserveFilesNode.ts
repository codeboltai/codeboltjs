import { LiteGraph } from '@codebolt/litegraph';
import { BaseMailServiceNode } from './BaseMailServiceNode';
import { NodeMetadata } from '../../../types';

export class BaseForceReserveFilesNode extends BaseMailServiceNode {
    static metadata: NodeMetadata = {
        type: "codebolt/mail/forceReserveFiles",
        title: "Force Reserve Files",
        category: "codebolt/mail",
        description: "Force reserve files, breaking existing locks",
        icon: "🔨",
        color: "#FF9800"
    };

    constructor() {
        super(BaseForceReserveFilesNode.metadata.title, BaseForceReserveFilesNode.metadata.type);
        this.addInput("agentId", "string");
        this.addInput("paths", "array");
        this.addInput("reason", "string");

        this.addOutput("reservationId", "string");
        this.addOutput("reserved", "boolean");
        this.addOutput("success", "boolean");
        this.addOutput("error", "string");
    }
}
