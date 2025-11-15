import { LGraphNode } from '@codebolt/litegraph';
import { NodeMetadata } from '../../types';

// Base Rand Node
export class BaseRandNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "math/rand",
    title: "Random",
    category: "math",
    description: "Random number",
    icon: "?",
    color: "#E91E63"
  };

  protected minValue: number = 0;
  protected maxValue: number = 1;

  constructor() {
    super(BaseRandNode.metadata.title, BaseRandNode.metadata.type);
    this.title = BaseRandNode.metadata.title;
    this.addProperty("min", this.minValue);
    this.addProperty("max", this.maxValue);
    this.addInput("min", "number");
    this.addInput("max", "number");
    this.addOutput("value", "number");
    this.size = [120, 60];

    // Properties used by frontend
    (this as any)._last_v = 0;
  }

  // Shared random generation
  generateRandom(min?: number, max?: number): number {
    const finalMin = min !== undefined ? min : Number(this.properties.min) || this.minValue;
    const finalMax = max !== undefined ? max : Number(this.properties.max) || this.maxValue;
    return Math.random() * (finalMax - finalMin) + finalMin;
  }

  // Default implementation
  onExecute() {
    if (this.inputs) {
      for (let i = 0; i < this.inputs.length; i++) {
        const input = this.inputs[i];
        const v = this.getInputData(i);
        if (v !== undefined) {
          this.properties[input.name] = v;
        }
      }
    }

    (this as any)._last_v = this.generateRandom();
    this.setOutputData(0, (this as any)._last_v);
  }

  onGetInputs() {
    return [["min", "number"], ["max", "number"]];
  }
}