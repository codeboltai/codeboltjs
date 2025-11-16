import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

export class BaseGetRepoMapNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/project/getRepoMap",
    title: "Get Repo Map",
    category: "codebolt/project",
    description: "Retrieves the repository map for the current workspace",
    icon: "🗺️",
    color: "#3949AB"
  };

  constructor() {
    super(BaseGetRepoMapNode.metadata.title, BaseGetRepoMapNode.metadata.type);
    this.title = BaseGetRepoMapNode.metadata.title;
    this.size = [360, 170];

    this.addProperty("message", "{}", "string");

    this.addInput("onTrigger", LiteGraph.ACTION);
    this.addInput("message", "object");

    this.addOutput("completed", LiteGraph.EVENT);
    this.addOutput("response", "object");
    this.addOutput("success", "boolean");
    this.addOutput("repoMap", "object");

    this.mode = LiteGraph.ON_TRIGGER;
  }
}
