import { LGraphNode } from '@codebolt/litegraph';
import { NodeMetadata } from '../../types';

// Base OR Node
export class BaseOrNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "logic/OR",
    title: "OR",
    category: "logic",
    description: "Logical OR",
    icon: "∨",
    color: "#FF5722"
  };

  constructor() {
    super(BaseOrNode.metadata.title, BaseOrNode.metadata.type);
    this.title = BaseOrNode.metadata.title;
    this.properties = {};
    this.addInput("a", "boolean");
    this.addInput("b", "boolean");
    this.addOutput("out", "boolean");
  }

  // Shared logic calculation
  performLogicalOr(inputData: any): boolean {
    let result = false;
    for (const inputKey in inputData) {
      if (inputData[inputKey]) {
        result = true;
        break;
      }
    }
    return result;
  }

  // Dynamic input support
  getDynamicInputs(): string[][] {
    return [["or", "boolean"]];
  }
}