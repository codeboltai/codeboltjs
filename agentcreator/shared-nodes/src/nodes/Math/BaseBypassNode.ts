import { LGraphNode } from '@codebolt/litegraph';
import { NodeMetadata } from '../../types';

// Base Bypass Node
export class BaseBypassNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "math/bypass",
    title: "Bypass",
    category: "math",
    description: "Removes the type",
    icon: "→",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseBypassNode.metadata.title, BaseBypassNode.metadata.type);
    this.title = BaseBypassNode.metadata.title;
    this.addInput("in", 0);
    this.addOutput("out", 0);
    this.size = [80, 30];
  }
}