import { LiteGraph } from '@codebolt/litegraph';
import { BaseMailServiceNode } from './BaseMailServiceNode';
import { NodeMetadata } from '../../../types';

export class BaseListReservationsNode extends BaseMailServiceNode {
    static metadata: NodeMetadata = {
        type: "codebolt/mail/listReservations",
        title: "List Reservations",
        category: "codebolt/mail",
        description: "List active file reservations",
        icon: "📋",
        color: "#FF9800"
    };

    constructor() {
        super(BaseListReservationsNode.metadata.title, BaseListReservationsNode.metadata.type);
        this.addInput("agentId", "string");
        this.addInput("path", "string");

        this.addOutput("reservations", "array");
        this.addOutput("success", "boolean");
        this.addOutput("error", "string");
    }
}
