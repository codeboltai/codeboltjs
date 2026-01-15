import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

export class BaseCodebaseSearchNode extends LGraphNode {
    static metadata: NodeMetadata = { type: "codebolt/codebaseSearch/search", title: "Codebase Search", category: "codebolt/codebaseSearch", description: "Search the codebase", icon: "🔍", color: "#795548" };
    constructor() {
        super(BaseCodebaseSearchNode.metadata.title, BaseCodebaseSearchNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("query", "string");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("results", "array");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}
