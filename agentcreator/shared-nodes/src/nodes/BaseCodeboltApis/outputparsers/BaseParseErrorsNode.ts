import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base ParseErrors Node - Calls codebolt.outputparsers.parseErrors
export class BaseParseErrorsNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/outputparsers/parseErrors",
    title: "Parse Errors",
    category: "codebolt/outputparsers",
    description: "Parses the given output and returns all the error messages",
    icon: "❌",
    color: "#F44336"
  };

  constructor() {
    super(BaseParseErrorsNode.metadata.title, BaseParseErrorsNode.metadata.type);
    this.title = BaseParseErrorsNode.metadata.title;
    this.size = [180, 100];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data input for output to parse
    this.addInput("output", "string"); // Can also accept array or object with toString()

    // Event output for parsing completion
    this.addOutput("errorsParsed", LiteGraph.EVENT);

    // Output for array of error messages
    this.addOutput("errors", "array");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}