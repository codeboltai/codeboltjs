import { LiteGraph } from '@codebolt/litegraph';
import { BaseMailServiceNode } from './BaseMailServiceNode';
import { NodeMetadata } from '../../../types';

export class BaseSendMessageNode extends BaseMailServiceNode {
    static metadata: NodeMetadata = {
        type: "codebolt/mail/sendMessage",
        title: "Send Message",
        category: "codebolt/mail",
        description: "Send a new message",
        icon: "📤",
        color: "#FF9800"
    };

    constructor() {
        super(BaseSendMessageNode.metadata.title, BaseSendMessageNode.metadata.type);
        this.addInput("senderId", "string");
        this.addInput("senderName", "string");
        this.addInput("recipients", "array");
        this.addInput("body", "string");
        this.addInput("subject", "string");

        this.addOutput("messageId", "string");
        this.addOutput("success", "boolean");
        this.addOutput("error", "string");
    }
}
