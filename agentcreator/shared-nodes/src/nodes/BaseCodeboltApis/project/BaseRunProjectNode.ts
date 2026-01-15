import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

export class BaseRunProjectNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/project/run",
    title: "Run Project",
    category: "codebolt/project",
    description: "Triggers the configured project run command",
    icon: "▶️",
    color: "#283593"
  };

  constructor() {
    super(BaseRunProjectNode.metadata.title, BaseRunProjectNode.metadata.type);
    this.title = BaseRunProjectNode.metadata.title;
    this.size = [260, 120];

    this.addInput("onTrigger", LiteGraph.ACTION);

    this.addOutput("completed", LiteGraph.EVENT);
    this.addOutput("response", "object");
    this.addOutput("success", "boolean");

    this.mode = LiteGraph.ON_TRIGGER;
  }
}
