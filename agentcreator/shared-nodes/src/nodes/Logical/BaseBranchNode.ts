import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../types';

// Base Branch Node - shared metadata and structure
export class BaseBranchNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "logic/branch",
    title: "Branch",
    category: "logic",
    description: "Branch execution on condition",
    icon: "⚡",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseBranchNode.metadata.title, BaseBranchNode.metadata.type);
    this.title = BaseBranchNode.metadata.title;
    this.properties = {};

    // Action input for triggering the branch
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Boolean condition input
    this.addInput("condition", "boolean");

    // Event outputs for true and false branches
    this.addOutput("true", LiteGraph.EVENT);
    this.addOutput("false", LiteGraph.EVENT);

    // Enable ON_TRIGGER mode so onExecute only runs when triggered
    this.mode = LiteGraph.ON_TRIGGER;
    this.size = [120, 60];
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}