import { LiteGraph } from '@codebolt/litegraph';
import { BaseMailServiceNode } from './BaseMailServiceNode';
import { NodeMetadata } from '../../../types';

export class BaseReserveFilesNode extends BaseMailServiceNode {
    static metadata: NodeMetadata = {
        type: "codebolt/mail/reserveFiles",
        title: "Reserve Files",
        category: "codebolt/mail",
        description: "Reserve files for exclusive or shared access",
        icon: "🔒",
        color: "#FF9800"
    };

    constructor() {
        super(BaseReserveFilesNode.metadata.title, BaseReserveFilesNode.metadata.type);
        this.addInput("agentId", "string");
        this.addInput("paths", "array");
        this.addInput("exclusive", "boolean");
        this.addInput("ttlSeconds", "number");
        this.addInput("reason", "string");

        this.addOutput("reservationId", "string");
        this.addOutput("reserved", "boolean");
        this.addOutput("success", "boolean");
        this.addOutput("error", "string");
    }
}
