import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base ParseJSON Node - Calls codebolt.outputparsers.parseJSON
export class BaseParseJSONNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/outputparsers/parseJSON",
    title: "Parse JSON",
    category: "codebolt/outputparsers",
    description: "Parses JSON string and returns a result object",
    icon: "📋",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseParseJSONNode.metadata.title, BaseParseJSONNode.metadata.type);
    this.title = BaseParseJSONNode.metadata.title;
    this.size = [180, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data input for JSON string
    this.addInput("jsonString", "string");

    // Event output for parsing completion
    this.addOutput("jsonParsed", LiteGraph.EVENT);

    // Output for parse result object
    this.addOutput("parseResult", "object");

    // Output for parsed data
    this.addOutput("parsed", "object");

    // Output for success status
    this.addOutput("success", "boolean");

    // Output for error message if any
    this.addOutput("error", "string");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}