import { LGraphNode } from '@codebolt/litegraph';
import { NodeMetadata } from '../../types/NodeMetadata';

export class BaseLerpNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "math/lerp",
    title: "Lerp",
    category: "math",
    description: "Linear Interpolation between two values",
    icon: "⇆",
    color: "#2196F3"
  };

  constructor() {
    super(BaseLerpNode.metadata.title, BaseLerpNode.metadata.type);
    this.title = BaseLerpNode.metadata.title;
    this.addProperty("f", 0.5);
    this.addInput("A", "number");
    this.addInput("B", "number");
    this.addInput("f", "number");
    this.addOutput("out", "number");
    this.size = [80, 60];
  }

  // Shared linear interpolation logic
  lerp(a: number, b: number, t: number): number {
    return a * (1 - t) + b * t;
  }
}