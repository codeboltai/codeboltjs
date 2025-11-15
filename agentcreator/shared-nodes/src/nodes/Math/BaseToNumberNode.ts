import { LGraphNode } from '@codebolt/litegraph';
import { NodeMetadata } from '../../types';

// Base ToNumber Node
export class BaseToNumberNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "math/to_number",
    title: "To Number",
    category: "math",
    description: "Cast to number",
    icon: "#",
    color: "#607D8B"
  };

  constructor() {
    super(BaseToNumberNode.metadata.title, BaseToNumberNode.metadata.type);
    this.title = BaseToNumberNode.metadata.title;
    this.addInput("in", "");
    this.addOutput("out", "number");
    this.size = [80, 30];
  }

  // Shared conversion logic
  convertToNumber(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value) || 0;
    if (typeof value === 'boolean') return value ? 1 : 0;
    return 0;
  }
}