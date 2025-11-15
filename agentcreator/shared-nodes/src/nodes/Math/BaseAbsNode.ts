import { LGraphNode } from '@codebolt/litegraph';
import { NodeMetadata } from '../../types';

// Base Abs Node
export class BaseAbsNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "math/abs",
    title: "Abs",
    category: "math",
    description: "Absolute value",
    icon: "|x|",
    color: "#E91E63"
  };

  constructor() {
    super(BaseAbsNode.metadata.title, BaseAbsNode.metadata.type);
    this.title = BaseAbsNode.metadata.title;
    this.addInput("in", "number");
    this.addOutput("out", "number");
    this.size = [80, 30];
  }

  // Shared absolute value calculation
  calculateAbs(value: number): number {
    return Math.abs(value || 0);
  }

  // Default implementation
  onExecute() {
    const v = this.getInputData(0);
    this.setOutputData(0, this.calculateAbs(v));
  }
}