import { LGraphNode } from '@codebolt/litegraph';
import { NodeMetadata } from '../../types';

// Base Selector Node
export class BaseSelectorNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "logic/selector",
    title: "Selector",
    category: "logic",
    description: "Selects an output",
    icon: "⊞",
    color: "#00BCD4"
  };

  constructor() {
    super(BaseSelectorNode.metadata.title, BaseSelectorNode.metadata.type);
    this.title = BaseSelectorNode.metadata.title;
    this.addProperty("index", 0);
    this.addInput("sel", "number");
    this.addInput("in", "");
    this.addOutput("out", "");
    this.size = [80, 60];
  }

  // Shared selection logic
  selectInput(inputs: any[], selectedIndex?: number): any {
    if (!inputs || inputs.length === 0) return null;
    const index = selectedIndex !== undefined ? selectedIndex : this.properties.index;
    return inputs[Math.min(Math.max(0, Math.floor(index)), inputs.length - 1)];
  }
}