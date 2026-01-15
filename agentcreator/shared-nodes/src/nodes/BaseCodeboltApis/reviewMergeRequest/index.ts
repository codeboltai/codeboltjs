import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';
export class BaseCreateMergeRequestNode extends LGraphNode {
    static metadata: NodeMetadata = { type: "codebolt/reviewMergeRequest/create", title: "Create Merge Request", category: "codebolt/reviewMergeRequest", description: "Create MR review", icon: "🔀", color: "#4CAF50" };
    constructor() { super(BaseCreateMergeRequestNode.metadata.title, BaseCreateMergeRequestNode.metadata.type); this.addInput("onTrigger", LiteGraph.ACTION); this.addInput("request", "object"); this.addOutput("onComplete", LiteGraph.EVENT); this.addOutput("mrId", "string"); this.addOutput("success", "boolean"); }
    mode = LiteGraph.ON_TRIGGER;
}
export class BaseListMergeRequestsNode extends LGraphNode {
    static metadata: NodeMetadata = { type: "codebolt/reviewMergeRequest/list", title: "List Merge Requests", category: "codebolt/reviewMergeRequest", description: "List MR reviews", icon: "📋", color: "#4CAF50" };
    constructor() { super(BaseListMergeRequestsNode.metadata.title, BaseListMergeRequestsNode.metadata.type); this.addInput("onTrigger", LiteGraph.ACTION); this.addOutput("onComplete", LiteGraph.EVENT); this.addOutput("requests", "array"); this.addOutput("success", "boolean"); }
    mode = LiteGraph.ON_TRIGGER;
}
