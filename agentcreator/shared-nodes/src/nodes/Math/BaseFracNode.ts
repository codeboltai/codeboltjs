import { LGraphNode } from '@codebolt/litegraph';
import { NodeMetadata } from '../../types/NodeMetadata';

export class BaseFracNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "math/frac",
    title: "Fraction",
    category: "math",
    description: "Get the fractional part of a number",
    icon: ".x",
    color: "#2196F3"
  };

  constructor() {
    super(BaseFracNode.metadata.title, BaseFracNode.metadata.type);
    this.title = BaseFracNode.metadata.title;
    this.addInput("in", "number");
    this.addOutput("out", "number");
    this.size = [80, 30];
  }

  // Shared fraction logic
  fraction(value: any): number {
    const num = value !== undefined ? Number(value) : 0;
    return num - Math.floor(num);
  }
}