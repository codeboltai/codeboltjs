import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../types';

// Base ToFixed Node - shared metadata and structure
export class BaseToFixedNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "string/toFixed",
    title: "To Fixed",
    category: "string",
    description: "Format a number to fixed decimal places",
    icon: "🔢",
    color: "#9E9E9E"
  };

  constructor() {
    super(BaseToFixedNode.metadata.title, BaseToFixedNode.metadata.type);
    this.title = BaseToFixedNode.metadata.title;
    this.addInput("number", "number");
    this.addInput("decimals", "number");
    this.addOutput("out", "string");
    this.size = [80, 30];
  }

  // Shared toFixed logic
  formatToFixed(num: number, decimals: number): string {
    if (num === undefined || num === null || isNaN(num)) return "0";
    if (decimals === undefined || decimals === null || isNaN(decimals)) return num.toString();

    return num.toFixed(Math.max(0, Math.min(20, decimals)));
  }
}