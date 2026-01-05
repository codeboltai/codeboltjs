import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';
export class BaseGetRoadmapNode extends LGraphNode {
    static metadata: NodeMetadata = { type: "codebolt/roadmap/getRoadmap", title: "Get Roadmap", category: "codebolt/roadmap", description: "Get project roadmap", icon: "🗺️", color: "#00BCD4" };
    constructor() { super(BaseGetRoadmapNode.metadata.title, BaseGetRoadmapNode.metadata.type); this.addInput("onTrigger", LiteGraph.ACTION); this.addOutput("onComplete", LiteGraph.EVENT); this.addOutput("roadmap", "object"); this.addOutput("success", "boolean"); }
    mode = LiteGraph.ON_TRIGGER;
}
export class BaseAddMilestoneNode extends LGraphNode {
    static metadata: NodeMetadata = { type: "codebolt/roadmap/addMilestone", title: "Add Milestone", category: "codebolt/roadmap", description: "Add milestone to roadmap", icon: "🎯", color: "#00BCD4" };
    constructor() { super(BaseAddMilestoneNode.metadata.title, BaseAddMilestoneNode.metadata.type); this.addInput("onTrigger", LiteGraph.ACTION); this.addInput("milestone", "object"); this.addOutput("onComplete", LiteGraph.EVENT); this.addOutput("milestoneId", "string"); this.addOutput("success", "boolean"); }
    mode = LiteGraph.ON_TRIGGER;
}
