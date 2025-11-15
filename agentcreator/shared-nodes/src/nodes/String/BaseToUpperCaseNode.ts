import { LGraphNode } from '@codebolt/litegraph';
import { NodeMetadata } from '../../types';

// Base ToUpperCase Node
export class BaseToUpperCaseNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "string/toUpperCase",
    title: "to UpperCase",
    category: "string",
    description: "Convert to uppercase",
    icon: "↑",
    color: "#9E9E9E"
  };

  constructor() {
    super(BaseToUpperCaseNode.metadata.title, BaseToUpperCaseNode.metadata.type);
    this.title = BaseToUpperCaseNode.metadata.title;
    this.addInput("in", "string");
    this.addOutput("out", "string");
    this.size = [100, 30];
  }

  // Shared conversion logic
  toUpperCase(value: any): string {
    const str = value !== undefined ? String(value) : "";
    return str.toUpperCase();
  }
}