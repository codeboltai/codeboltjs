import { LiteGraph } from '@codebolt/litegraph';
import { BaseMailServiceNode } from './BaseMailServiceNode';
import { NodeMetadata } from '../../../types';

export class BaseReplyMessageNode extends BaseMailServiceNode {
    static metadata: NodeMetadata = {
        type: "codebolt/mail/replyMessage",
        title: "Reply Message",
        category: "codebolt/mail",
        description: "Reply to a message",
        icon: "↩️",
        color: "#FF9800"
    };

    constructor() {
        super(BaseReplyMessageNode.metadata.title, BaseReplyMessageNode.metadata.type);
        this.addInput("messageId", "string");
        this.addInput("senderId", "string");
        this.addInput("senderName", "string");
        this.addInput("body", "string");

        this.addOutput("newMessageId", "string");
        this.addOutput("success", "boolean");
        this.addOutput("error", "string");
    }
}
