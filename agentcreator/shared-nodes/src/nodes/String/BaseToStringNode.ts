import { LGraphNode } from '@codebolt/litegraph';
import { NodeMetadata } from '../../types';

// Base ToString Node
export class BaseToStringNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "string/toString",
    title: "to String",
    category: "string",
    description: "Convert to string",
    icon: "S",
    color: "#9E9E9E"
  };

  constructor() {
    super(BaseToStringNode.metadata.title, BaseToStringNode.metadata.type);
    this.title = BaseToStringNode.metadata.title;
    this.addInput("in", "");
    this.addOutput("out", "string");
    this.size = [80, 30];
  }

  // Shared conversion logic
  convertToString(value: any): string {
    if (value === null || value === undefined) return "";
    return String(value);
  }
}