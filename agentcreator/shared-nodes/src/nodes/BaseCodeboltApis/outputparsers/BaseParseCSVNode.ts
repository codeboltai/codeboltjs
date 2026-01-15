import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base ParseCSV Node - Calls codebolt.outputparsers.parseCSV
export class BaseParseCSVNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/outputparsers/parseCSV",
    title: "Parse CSV",
    category: "codebolt/outputparsers",
    description: "Parses CSV string and returns a result object",
    icon: "📊",
    color: "#2196F3"
  };

  constructor() {
    super(BaseParseCSVNode.metadata.title, BaseParseCSVNode.metadata.type);
    this.title = BaseParseCSVNode.metadata.title;
    this.size = [180, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data input for CSV string
    this.addInput("csvString", "string");

    // Event output for parsing completion
    this.addOutput("csvParsed", LiteGraph.EVENT);

    // Output for parse result object
    this.addOutput("parseResult", "object");

    // Output for parsed data (array of CSV rows)
    this.addOutput("parsed", "array");

    // Output for success status
    this.addOutput("success", "boolean");

    // Output for error message if any
    this.addOutput("error", "string");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}