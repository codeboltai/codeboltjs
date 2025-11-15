import { LGraphNode } from '@codebolt/litegraph';
import { NodeMetadata } from '../../types/NodeMetadata';

export class BaseSmoothStepNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "math/smoothstep",
    title: "SmoothStep",
    category: "math",
    description: "Smooth Hermite interpolation between two edges",
    icon: "〰",
    color: "#2196F3"
  };

  constructor() {
    super(BaseSmoothStepNode.metadata.title, BaseSmoothStepNode.metadata.type);
    this.title = BaseSmoothStepNode.metadata.title;
    this.addProperty("edge0", 0);
    this.addProperty("edge1", 1);
    this.addProperty("x", 0);
    this.addInput("edge0", "number");
    this.addInput("edge1", "number");
    this.addInput("x", "number");
    this.addOutput("out", "number");
    this.size = [100, 60];
  }

  // Shared smoothstep logic
  smoothStep(edge0: number, edge1: number, x: number): number {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }
}