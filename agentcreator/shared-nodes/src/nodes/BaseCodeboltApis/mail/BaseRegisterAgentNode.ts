import { LiteGraph } from '@codebolt/litegraph';
import { BaseMailServiceNode } from './BaseMailServiceNode';
import { NodeMetadata } from '../../../types';

export class BaseRegisterAgentNode extends BaseMailServiceNode {
    static metadata: NodeMetadata = {
        type: "codebolt/mail/registerAgent",
        title: "Register Mail Agent",
        category: "codebolt/mail",
        description: "Register a new agent for mail service",
        icon: "📮",
        color: "#FF9800"
    };

    constructor() {
        super(BaseRegisterAgentNode.metadata.title, BaseRegisterAgentNode.metadata.type);
        this.addInput("name", "string");
        this.addInput("program", "string");
        this.addInput("model", "string");

        this.addOutput("agentId", "string");
        this.addOutput("success", "boolean");
        this.addOutput("error", "string");
    }
}
