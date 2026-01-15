import { LGraphNode } from '@codebolt/litegraph';

// Base Sum Node - shared metadata and structure
export class BaseSumNode extends LGraphNode {
  static metadata = {
    type: "math/sum",
    title: "Sum",
    category: "math",
    description: "Adds two numbers together",
    icon: "Σ",
    color: "#2196F3"
  };

  constructor() {
    super(BaseSumNode.metadata.title, BaseSumNode.metadata.type);
    this.title = BaseSumNode.metadata.title;
    this.properties = { precision: 1 };
    this.addInput("A", "number");
    this.addInput("B", "number");
    this.addOutput("A+B", "number");
  }

  // Shared calculation logic
  calculateSum(a: number, b: number) {
    const precision = Number(this.properties.precision) || 1;
    const sum = (a || 0) + (b || 0);
    return Math.round(sum * Math.pow(10, precision)) / Math.pow(10, precision);
  }

  // Default implementation
  onExecute() {
    const A = Number(this.getInputData(0)) || 0;
    const B = Number(this.getInputData(1)) || 0;
    this.setOutputData(0, this.calculateSum(A, B));
  }
}