import { LGraphNode } from '@codebolt/litegraph';
import { NodeMetadata } from '../../utils';

// Base NOT Node
export class BaseNotNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "logic/NOT",
    title: "NOT",
    category: "logic",
    description: "Logical NOT",
    icon: "¬",
    color: "#FF5722"
  };

  constructor() {
    super(BaseNotNode.metadata.title, BaseNotNode.metadata.type);
    this.title = BaseNotNode.metadata.title;
    this.addInput("in", "boolean");
    this.addOutput("out", "boolean");
    this.size = [80, 30];
  }

  // Shared NOT logic
  performNot(value: any): boolean {
    return !Boolean(value);
  }
}