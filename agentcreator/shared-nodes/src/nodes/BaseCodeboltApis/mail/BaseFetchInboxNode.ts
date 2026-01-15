import { LiteGraph } from '@codebolt/litegraph';
import { BaseMailServiceNode } from './BaseMailServiceNode';
import { NodeMetadata } from '../../../types';

export class BaseFetchInboxNode extends BaseMailServiceNode {
    static metadata: NodeMetadata = {
        type: "codebolt/mail/fetchInbox",
        title: "Fetch Inbox",
        category: "codebolt/mail",
        description: "Fetch messages from inbox",
        icon: "📥",
        color: "#FF9800"
    };

    constructor() {
        super(BaseFetchInboxNode.metadata.title, BaseFetchInboxNode.metadata.type);
        this.addInput("agentId", "string");
        this.addInput("unreadOnly", "boolean");
        this.addInput("limit", "number");
        this.addInput("offset", "number");

        this.addOutput("messages", "array");
        this.addOutput("success", "boolean");
        this.addOutput("error", "string");
    }
}
