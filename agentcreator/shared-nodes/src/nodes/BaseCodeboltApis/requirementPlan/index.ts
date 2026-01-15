import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';
export class BaseCreateRequirementPlanNode extends LGraphNode {
    static metadata: NodeMetadata = { type: "codebolt/requirementPlan/create", title: "Create Requirement Plan", category: "codebolt/requirementPlan", description: "Create requirement plan", icon: "📋", color: "#2196F3" };
    constructor() { super(BaseCreateRequirementPlanNode.metadata.title, BaseCreateRequirementPlanNode.metadata.type); this.addInput("onTrigger", LiteGraph.ACTION); this.addInput("plan", "object"); this.addOutput("onComplete", LiteGraph.EVENT); this.addOutput("planId", "string"); this.addOutput("success", "boolean"); }
    mode = LiteGraph.ON_TRIGGER;
}
export class BaseGetRequirementPlanNode extends LGraphNode {
    static metadata: NodeMetadata = { type: "codebolt/requirementPlan/get", title: "Get Requirement Plan", category: "codebolt/requirementPlan", description: "Get requirement plan", icon: "📖", color: "#2196F3" };
    constructor() { super(BaseGetRequirementPlanNode.metadata.title, BaseGetRequirementPlanNode.metadata.type); this.addInput("onTrigger", LiteGraph.ACTION); this.addInput("planId", "string"); this.addOutput("onComplete", LiteGraph.EVENT); this.addOutput("plan", "object"); this.addOutput("success", "boolean"); }
    mode = LiteGraph.ON_TRIGGER;
}
