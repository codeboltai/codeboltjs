import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';
export class BaseDeliberateNode extends LGraphNode {
    static metadata: NodeMetadata = { type: "codebolt/agentDeliberation/deliberate", title: "Agent Deliberate", category: "codebolt/agentDeliberation", description: "Agent deliberation", icon: "🤔", color: "#9C27B0" };
    constructor() { super(BaseDeliberateNode.metadata.title, BaseDeliberateNode.metadata.type); this.addInput("onTrigger", LiteGraph.ACTION); this.addInput("context", "object"); this.addOutput("onComplete", LiteGraph.EVENT); this.addOutput("result", "object"); this.addOutput("success", "boolean"); }
    mode = LiteGraph.ON_TRIGGER;
}
