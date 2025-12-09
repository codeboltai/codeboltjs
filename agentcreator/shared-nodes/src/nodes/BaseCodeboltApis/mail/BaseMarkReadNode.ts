import { LiteGraph } from '@codebolt/litegraph';
import { BaseMailServiceNode } from './BaseMailServiceNode';
import { NodeMetadata } from '../../../types';

export class BaseMarkReadNode extends BaseMailServiceNode {
    static metadata: NodeMetadata = {
        type: "codebolt/mail/markRead",
        title: "Mark READ",
        category: "codebolt/mail",
        description: "Mark a message as read",
        icon: "👁️",
        color: "#FF9800"
    };

    constructor() {
        super(BaseMarkReadNode.metadata.title, BaseMarkReadNode.metadata.type);
        this.addInput("messageId", "string");
        this.addInput("agentId", "string");

        this.addOutput("success", "boolean");
        this.addOutput("error", "string");
    }
}
