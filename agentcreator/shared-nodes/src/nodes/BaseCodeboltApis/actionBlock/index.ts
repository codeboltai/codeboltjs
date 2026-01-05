import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';
export class BaseExecuteActionBlockNode extends LGraphNode {
    static metadata: NodeMetadata = { type: "codebolt/actionBlock/execute", title: "Execute Action Block", category: "codebolt/actionBlock", description: "Execute action block", icon: "⚡", color: "#FF5722" };
    constructor() { super(BaseExecuteActionBlockNode.metadata.title, BaseExecuteActionBlockNode.metadata.type); this.addInput("onTrigger", LiteGraph.ACTION); this.addInput("block", "object"); this.addOutput("onComplete", LiteGraph.EVENT); this.addOutput("result", "any"); this.addOutput("success", "boolean"); }
    mode = LiteGraph.ON_TRIGGER;
}
