import { LGraphNode } from '@codebolt/litegraph';
import { NodeMetadata } from '../../types';

// Base Compare Node
export class BaseCompareNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "string/compare",
    title: "Compare",
    category: "string",
    description: "Compare two strings",
    icon: "==",
    color: "#9E9E9E"
  };

  constructor() {
    super(BaseCompareNode.metadata.title, BaseCompareNode.metadata.type);
    this.title = BaseCompareNode.metadata.title;
    this.addProperty("case_sensitive", true);
    this.addInput("a", "string");
    this.addInput("b", "string");
    this.addOutput("out", "boolean");
    this.size = [80, 50];
  }

  // Shared comparison logic
  compareStrings(a: any, b: any, caseSensitive: boolean = true): boolean {
    const strA = a !== undefined ? String(a) : "";
    const strB = b !== undefined ? String(b) : "";

    if (caseSensitive) {
      return strA === strB;
    } else {
      return strA.toLowerCase() === strB.toLowerCase();
    }
  }
}