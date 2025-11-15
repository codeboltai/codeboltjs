import { LGraphNode } from '@codebolt/litegraph';
import { NodeMetadata } from '../../types/NodeMetadata';

export class BaseRangeNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "math/range",
    title: "Range",
    category: "math",
    description: "Convert a number from one range to another",
    icon: "↔",
    color: "#2196F3"
  };

  constructor() {
    super(BaseRangeNode.metadata.title, BaseRangeNode.metadata.type);
    this.title = BaseRangeNode.metadata.title;
    this.addProperty("in", 0);
    this.addProperty("in_min", 0);
    this.addProperty("in_max", 1);
    this.addProperty("out_min", 0);
    this.addProperty("out_max", 1);

    // Define inputs and outputs
    this.addInput("in", "number", { locked: true });
    this.addInput("in_min", "number");
    this.addInput("in_max", "number");
    this.addInput("out_min", "number");
    this.addInput("out_max", "number");
    this.addOutput("out", "number", { locked: true });
    this.addOutput("clamped", "number", { locked: true });
    this.size = [120, 50];
  }

  // Shared range conversion logic
  convertRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
    return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
  }

  clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  // Default implementation (can be overridden by agent for backend execution)
  onExecute() {
    // Update properties from inputs
    if (this.inputs) {
      for (let i = 0; i < this.inputs.length; i++) {
        const input = this.inputs[i];
        const v = this.getInputData(i);
        if (v !== undefined) {
          this.properties[input.name] = v;
        }
      }
    }

    const inputValue = this.properties.in || 0;
    const in_min = this.properties.in_min || 0;
    const in_max = this.properties.in_max || 1;
    const out_min = this.properties.out_min || 0;
    const out_max = this.properties.out_max || 1;

    (this as any)._last_v = this.convertRange(inputValue, in_min, in_max, out_min, out_max);
    this.setOutputData(0, (this as any)._last_v);
    this.setOutputData(1, this.clamp((this as any)._last_v, out_min, out_max));
  }
}