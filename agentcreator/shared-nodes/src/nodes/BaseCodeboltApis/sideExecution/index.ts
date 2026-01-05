import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';
export class BaseStartSideExecutionNode extends LGraphNode {
    static metadata: NodeMetadata = { type: "codebolt/sideExecution/start", title: "Start Side Execution", category: "codebolt/sideExecution", description: "Start side execution", icon: "🔀", color: "#E91E63" };
    constructor() { super(BaseStartSideExecutionNode.metadata.title, BaseStartSideExecutionNode.metadata.type); this.addInput("onTrigger", LiteGraph.ACTION); this.addInput("task", "object"); this.addOutput("onComplete", LiteGraph.EVENT); this.addOutput("executionId", "string"); this.addOutput("success", "boolean"); }
    mode = LiteGraph.ON_TRIGGER;
}
