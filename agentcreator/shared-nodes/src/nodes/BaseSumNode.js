import { LGraphNode } from '@codebolt/litegraph';

// Base Sum Node - shared metadata and structure
export class BaseSumNode extends LGraphNode {
  static metadata = {
    type: "basic/sum",
    title: "Sum",
    category: "basic",
    description: "Adds two numbers together",
    icon: "Σ",
    color: "#2196F3"
  };

  constructor() {
    super();
    this.title = BaseSumNode.metadata.title;
    this.properties = { precision: 1 };
    this.addInput("A", "number");
    this.addInput("B", "number");
    this.addOutput("A+B", "number");
  }

  // Shared calculation logic
  calculateSum(a, b) {
    const precision = this.properties.precision || 1;
    const sum = (a || 0) + (b || 0);
    return Math.round(sum * Math.pow(10, precision)) / Math.pow(10, precision);
  }
}