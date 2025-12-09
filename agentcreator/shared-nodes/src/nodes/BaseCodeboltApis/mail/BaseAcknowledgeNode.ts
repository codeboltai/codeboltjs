import { LiteGraph } from '@codebolt/litegraph';
import { BaseMailServiceNode } from './BaseMailServiceNode';
import { NodeMetadata } from '../../../types';

export class BaseAcknowledgeNode extends BaseMailServiceNode {
    static metadata: NodeMetadata = {
        type: "codebolt/mail/acknowledge",
        title: "Acknowledge Message",
        category: "codebolt/mail",
        description: "Acknowledge receipt of a message",
        icon: "✅",
        color: "#FF9800"
    };

    constructor() {
        super(BaseAcknowledgeNode.metadata.title, BaseAcknowledgeNode.metadata.type);
        this.addInput("messageId", "string");
        this.addInput("agentId", "string");

        this.addOutput("success", "boolean");
        this.addOutput("error", "string");
    }
}
