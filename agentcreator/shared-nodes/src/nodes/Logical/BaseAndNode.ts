import { LGraphNode } from '@codebolt/litegraph';

// Base AND Node - shared metadata and structure
export class BaseAndNode extends LGraphNode {
  static metadata = {
    type: "logic/AND",
    title: "AND",
    category: "logic",
    description: "Logical AND",
    icon: "∧",
    color: "#FF5722"
  };

  constructor() {
    super(BaseAndNode.metadata.title, BaseAndNode.metadata.type);
    this.title = BaseAndNode.metadata.title;
    this.properties = {};
    this.addInput("a", "boolean");
    this.addInput("b", "boolean");
    this.addOutput("out", "boolean");
  }

  // Shared logic calculation
  performLogicalAnd(inputData) {
    let result = true;
    for (const inputKey in inputData) {
      if (!inputData[inputKey]) {
        result = false;
        break;
      }
    }
    return result;
  }

  // Dynamic input support
  getDynamicInputs() {
    return [["and", "boolean"]];
  }
}