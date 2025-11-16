import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../types';

// Base Split Node - shared metadata and structure
export class BaseSplitNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "string/split",
    title: "Split",
    category: "string",
    description: "Split a string by a delimiter",
    icon: "✂️",
    color: "#9E9E9E"
  };

  constructor() {
    super(BaseSplitNode.metadata.title, BaseSplitNode.metadata.type);
    this.title = BaseSplitNode.metadata.title;
    this.addInput("string", "string");
    this.addInput("delimiter", "string");
    this.addOutput("out", "array");
    this.size = [80, 30];
  }

  // Shared split logic
  splitString(str: string, delimiter: string): string[] {
    if (str === undefined || str === null || str === "") return [];
    if (delimiter === undefined || delimiter === null || delimiter === "") return [str];

    return str.split(delimiter);
  }
}