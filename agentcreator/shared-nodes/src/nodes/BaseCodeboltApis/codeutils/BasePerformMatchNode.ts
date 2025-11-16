import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base PerformMatch Node - Calls codebolt.codeutils.performMatch
export class BasePerformMatchNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/codeutils/performMatch",
    title: "Perform Code Match",
    category: "codebolt/codeutils",
    description: "Performs a matching operation based on provided matcher definition and problem patterns",
    icon: "🔍",
    color: "#FF9800"
  };

  constructor() {
    super(BasePerformMatchNode.metadata.title, BasePerformMatchNode.metadata.type);
    this.title = BasePerformMatchNode.metadata.title;
    this.size = [220, 160];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs for matching operation
    this.addInput("matcherDefinition", "object"); // Object with name, pattern, language, etc.
    this.addInput("problemPatterns", "array"); // Array of regex patterns with severity levels
    this.addInput("problems", "array"); // Optional list of pre-existing problems

    // Event output for matching completion
    this.addOutput("matchCompleted", LiteGraph.EVENT);

    // Output for match problem response
    this.addOutput("matchResult", "object");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}