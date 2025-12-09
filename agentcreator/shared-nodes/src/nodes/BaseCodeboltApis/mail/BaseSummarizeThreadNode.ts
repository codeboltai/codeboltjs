import { LiteGraph } from '@codebolt/litegraph';
import { BaseMailServiceNode } from './BaseMailServiceNode';
import { NodeMetadata } from '../../../types';

export class BaseSummarizeThreadNode extends BaseMailServiceNode {
    static metadata: NodeMetadata = {
        type: "codebolt/mail/summarizeThread",
        title: "Summarize Thread",
        category: "codebolt/mail",
        description: "Summarize a message thread",
        icon: "📝",
        color: "#FF9800"
    };

    constructor() {
        super(BaseSummarizeThreadNode.metadata.title, BaseSummarizeThreadNode.metadata.type);
        this.addInput("threadId", "string");
        this.addInput("maxMessages", "number");

        this.addOutput("summary", "string");
        this.addOutput("success", "boolean");
        this.addOutput("error", "string");
    }
}
