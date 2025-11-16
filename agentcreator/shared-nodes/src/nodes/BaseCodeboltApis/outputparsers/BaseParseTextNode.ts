import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base ParseText Node - Calls codebolt.outputparsers.parseText
export class BaseParseTextNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/outputparsers/parseText",
    title: "Parse Text",
    category: "codebolt/outputparsers",
    description: "Parses text string and returns a result object with lines",
    icon: "📝",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseParseTextNode.metadata.title, BaseParseTextNode.metadata.type);
    this.title = BaseParseTextNode.metadata.title;
    this.size = [180, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data input for text
    this.addInput("text", "string");

    // Event output for parsing completion
    this.addOutput("textParsed", LiteGraph.EVENT);

    // Output for parse result object
    this.addOutput("parseResult", "object");

    // Output for parsed data (array of lines)
    this.addOutput("parsed", "array");

    // Output for success status
    this.addOutput("success", "boolean");

    // Output for error message if any
    this.addOutput("error", "string");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}