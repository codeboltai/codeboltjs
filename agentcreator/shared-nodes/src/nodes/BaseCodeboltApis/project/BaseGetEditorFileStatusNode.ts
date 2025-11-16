import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

export class BaseGetEditorFileStatusNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/project/getEditorFileStatus",
    title: "Get Editor File Status",
    category: "codebolt/project",
    description: "Retrieves the status of files currently open in the editor",
    icon: "📝",
    color: "#1E88E5"
  };

  constructor() {
    super(BaseGetEditorFileStatusNode.metadata.title, BaseGetEditorFileStatusNode.metadata.type);
    this.title = BaseGetEditorFileStatusNode.metadata.title;
    this.size = [340, 150];

    this.addInput("onTrigger", LiteGraph.ACTION);

    this.addOutput("completed", LiteGraph.EVENT);
    this.addOutput("response", "object");
    this.addOutput("success", "boolean");
    this.addOutput("status", "object");

    this.mode = LiteGraph.ON_TRIGGER;
  }
}
