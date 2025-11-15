import { LGraphNode } from '@codebolt/litegraph';
import { NodeMetadata } from '../../types';

// Base Clamp Node
export class BaseClampNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "math/clamp",
    title: "Clamp",
    category: "math",
    description: "Clamp number between min and max",
    icon: "⬓",
    color: "#E91E63"
  };

  constructor() {
    super(BaseClampNode.metadata.title, BaseClampNode.metadata.type);
    this.title = BaseClampNode.metadata.title;
    this.addProperty("min", 0);
    this.addProperty("max", 1);
    this.addInput("in", "number");
    this.addInput("min", "number");
    this.addInput("max", "number");
    this.addOutput("out", "number");
    this.size = [120, 80];
  }

  // Shared clamp calculation
  calculateClamp(value: number, min?: number, max?: number): number {
    const finalMin = Number(min !== undefined ? min : this.properties.min);
    const finalMax = Number(max !== undefined ? max : this.properties.max);
    return Math.max(finalMin, Math.min(finalMax, value || 0));
  }
}