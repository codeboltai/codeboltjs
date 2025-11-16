import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base ParseXML Node - Calls codebolt.outputparsers.parseXML
export class BaseParseXMLNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/outputparsers/parseXML",
    title: "Parse XML",
    category: "codebolt/outputparsers",
    description: "Parses XML string and returns a result object",
    icon: "🏷️",
    color": "#FF9800"
  };

  constructor() {
    super(BaseParseXMLNode.metadata.title, BaseParseXMLNode.metadata.type);
    this.title = BaseParseXMLNode.metadata.title;
    this.size = [180, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data input for XML string
    this.addInput("xmlString", "string");

    // Event output for parsing completion
    this.addOutput("xmlParsed", LiteGraph.EVENT);

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