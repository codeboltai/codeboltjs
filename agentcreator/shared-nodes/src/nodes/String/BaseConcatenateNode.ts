import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../types';

// Base Concatenate Node - shared metadata and structure
export class BaseConcatenateNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "string/concatenate",
    title: "Concatenate",
    category: "string",
    description: "Join two strings",
    icon: "+",
    color: "#9E9E9E"
  };

  constructor() {
    super(BaseConcatenateNode.metadata.title, BaseConcatenateNode.metadata.type);
    this.title = BaseConcatenateNode.metadata.title;
    this.addInput("a", "string");
    this.addInput("b", "string");
    this.addOutput("out", "string");
    this.size = [80, 30];
  }

  // Shared concatenation logic
  concatenateStrings(a: string | undefined, b: string | undefined): string {
    if (a === undefined || a === null) {
      return b || "";
    } else if (b === undefined || b === null) {
      return a || "";
    } else {
      return a + b;
    }
  }
}