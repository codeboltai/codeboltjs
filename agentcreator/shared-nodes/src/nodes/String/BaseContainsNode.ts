import { LGraphNode } from '@codebolt/litegraph';
import { NodeMetadata } from '../../types';

// Base Contains Node
export class BaseContainsNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "string/contains",
    title: "Contains",
    category: "string",
    description: "Check if contains substring",
    icon: "∈",
    color: "#9E9E9E"
  };

  constructor() {
    super(BaseContainsNode.metadata.title, BaseContainsNode.metadata.type);
    this.title = BaseContainsNode.metadata.title;
    this.addProperty("case_sensitive", true);
    this.addInput("string", "string");
    this.addInput("substring", "string");
    this.addOutput("out", "boolean");
    this.size = [100, 60];
  }

  // Shared contains logic
  containsSubstring(str: any, substr: any, caseSensitive: boolean = true): boolean {
    const string = str !== undefined ? String(str) : "";
    const substring = substr !== undefined ? String(substr) : "";

    if (caseSensitive) {
      return string.includes(substring);
    } else {
      return string.toLowerCase().includes(substring.toLowerCase());
    }
  }
}