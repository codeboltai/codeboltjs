import { LGraphNode } from '@codebolt/litegraph';
import { NodeMetadata } from '../../types/NodeMetadata';

export class BaseScaleNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "math/scale",
    title: "Scale",
    category: "math",
    description: "Scale a number by a factor",
    icon: "×",
    color: "#2196F3"
  };

  constructor() {
    super(BaseScaleNode.metadata.title, BaseScaleNode.metadata.type);
    this.title = BaseScaleNode.metadata.title;
    this.addProperty("factor", 1);
    this.addInput("in", "number");
    this.addInput("factor", "number");
    this.addOutput("out", "number");
    this.size = [80, 50];
  }

  // Shared scale logic
  scale(value: any, factor?: any): number {
    const val = value !== undefined ? Number(value) : 0;
    const fac = factor !== undefined ? Number(factor) : Number(this.properties.factor) || 1;
    return val * fac;
  }
}