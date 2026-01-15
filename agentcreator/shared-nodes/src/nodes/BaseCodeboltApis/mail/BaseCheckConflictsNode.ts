import { LiteGraph } from '@codebolt/litegraph';
import { BaseMailServiceNode } from './BaseMailServiceNode';
import { NodeMetadata } from '../../../types';

export class BaseCheckConflictsNode extends BaseMailServiceNode {
    static metadata: NodeMetadata = {
        type: "codebolt/mail/checkConflicts",
        title: "Check Conflicts",
        category: "codebolt/mail",
        description: "Check for reservation conflicts",
        icon: "⚔️",
        color: "#FF9800"
    };

    constructor() {
        super(BaseCheckConflictsNode.metadata.title, BaseCheckConflictsNode.metadata.type);
        this.addInput("agentId", "string");
        this.addInput("paths", "array");

        this.addOutput("conflicts", "array");
        this.addOutput("success", "boolean");
        this.addOutput("error", "string");
    }
}
