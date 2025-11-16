import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base ParseWarnings Node - Calls codebolt.outputparsers.parseWarnings
export class BaseParseWarningsNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/outputparsers/parseWarnings",
    title: "Parse Warnings",
    category: "codebolt/outputparsers",
    description: "Parses the given output and returns all the warning messages",
    icon: "⚠️",
    color: "#FFC107"
  };

  constructor() {
    super(BaseParseWarningsNode.metadata.title, BaseParseWarningsNode.metadata.type);
    this.title = BaseParseWarningsNode.metadata.title;
    this.size = [200, 100];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data input for output to parse
    this.addInput("output", "string"); // Can also accept array or object with toString()

    // Event output for parsing completion
    this.addOutput("warningsParsed", LiteGraph.EVENT);

    // Output for array of warning messages
    this.addOutput("warnings", "array");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}