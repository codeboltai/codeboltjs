import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

export class BaseGetProjectPathNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/project/getPath",
    title: "Get Project Path",
    category: "codebolt/project",
    description: "Retrieves the current project's path information",
    icon: "📁",
    color: "#5C6BC0"
  };

  constructor() {
    super(BaseGetProjectPathNode.metadata.title, BaseGetProjectPathNode.metadata.type);
    this.title = BaseGetProjectPathNode.metadata.title;
    this.size = [320, 150];

    this.addInput("onTrigger", LiteGraph.ACTION);

    this.addOutput("completed", LiteGraph.EVENT);
    this.addOutput("response", "object");
    this.addOutput("success", "boolean");
    this.addOutput("projectPath", "string");
    this.addOutput("projectName", "string");

    this.mode = LiteGraph.ON_TRIGGER;
  }
}
