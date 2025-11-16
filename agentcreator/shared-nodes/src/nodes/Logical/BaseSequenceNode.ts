import { LGraphNode } from '@codebolt/litegraph';
import { NodeMetadata } from '../../types';

// Base Sequence Node - shared metadata and structure
export class BaseSequenceNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "logic/sequence",
    title: "Sequence",
    category: "logic",
    description: "Selects one element from a sequence",
    icon: "≡",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseSequenceNode.metadata.title, BaseSequenceNode.metadata.type);
    this.title = BaseSequenceNode.metadata.title;
    this.properties = {
      sequence: "A,B,C"
    };
    this.addInput("index", "number");
    this.addInput("seq", "string");
    this.addOutput("out", "");
    this.size = [120, 80];
  }

  // Shared sequence selection logic
  selectFromSequence(sequence: string, index: number): string {
    const values = sequence ? sequence.split(",") : [];
    const safeIndex = Math.min(Math.max(0, Math.floor(Number(index))), values.length - 1);
    return values[safeIndex] || "";
  }

  // Parse sequence string into array
  parseSequence(sequence: string): string[] {
    return sequence ? sequence.split(",") : [];
  }

  // Handle property changes
  onPropertyChanged(name: string, value: unknown, prev_value?: unknown): boolean {
    if (name === "sequence" && typeof value === "string") {
      // Update sequence property
      this.properties.sequence = value;
      return true;
    }
    return true;
  }
}