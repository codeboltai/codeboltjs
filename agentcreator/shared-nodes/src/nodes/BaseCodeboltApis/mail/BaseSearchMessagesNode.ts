import { LiteGraph } from '@codebolt/litegraph';
import { BaseMailServiceNode } from './BaseMailServiceNode';
import { NodeMetadata } from '../../../types';

export class BaseSearchMessagesNode extends BaseMailServiceNode {
    static metadata: NodeMetadata = {
        type: "codebolt/mail/searchMessages",
        title: "Search Messages",
        category: "codebolt/mail",
        description: "Search for messages",
        icon: "🔍",
        color: "#FF9800"
    };

    constructor() {
        super(BaseSearchMessagesNode.metadata.title, BaseSearchMessagesNode.metadata.type);
        this.addInput("query", "string");
        this.addInput("agentId", "string");
        this.addInput("limit", "number");

        this.addOutput("messages", "array");
        this.addOutput("success", "boolean");
        this.addOutput("error", "string");
    }
}
