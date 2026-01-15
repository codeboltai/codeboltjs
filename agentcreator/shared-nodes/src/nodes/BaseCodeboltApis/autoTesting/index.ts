import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';
export class BaseRunTestsNode extends LGraphNode {
    static metadata: NodeMetadata = { type: "codebolt/autoTesting/runTests", title: "Run Tests", category: "codebolt/autoTesting", description: "Run automated tests", icon: "🧪", color: "#4CAF50" };
    constructor() { super(BaseRunTestsNode.metadata.title, BaseRunTestsNode.metadata.type); this.addInput("onTrigger", LiteGraph.ACTION); this.addInput("config", "object"); this.addOutput("onComplete", LiteGraph.EVENT); this.addOutput("results", "object"); this.addOutput("success", "boolean"); }
    mode = LiteGraph.ON_TRIGGER;
}
export class BaseGetTestResultsNode extends LGraphNode {
    static metadata: NodeMetadata = { type: "codebolt/autoTesting/getResults", title: "Get Test Results", category: "codebolt/autoTesting", description: "Get test results", icon: "📊", color: "#4CAF50" };
    constructor() { super(BaseGetTestResultsNode.metadata.title, BaseGetTestResultsNode.metadata.type); this.addInput("onTrigger", LiteGraph.ACTION); this.addInput("testId", "string"); this.addOutput("onComplete", LiteGraph.EVENT); this.addOutput("results", "object"); this.addOutput("success", "boolean"); }
    mode = LiteGraph.ON_TRIGGER;
}
