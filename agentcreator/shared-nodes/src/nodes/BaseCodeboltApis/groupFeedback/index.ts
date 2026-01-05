import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';
export class BaseSubmitFeedbackNode extends LGraphNode {
    static metadata: NodeMetadata = { type: "codebolt/groupFeedback/submitFeedback", title: "Submit Feedback", category: "codebolt/groupFeedback", description: "Submit group feedback", icon: "📢", color: "#FF9800" };
    constructor() { super(BaseSubmitFeedbackNode.metadata.title, BaseSubmitFeedbackNode.metadata.type); this.addInput("onTrigger", LiteGraph.ACTION); this.addInput("feedback", "object"); this.addOutput("onComplete", LiteGraph.EVENT); this.addOutput("success", "boolean"); }
    mode = LiteGraph.ON_TRIGGER;
}
