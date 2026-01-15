import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

export class BaseGetProjectSettingsNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/project/getSettings",
    title: "Get Project Settings",
    category: "codebolt/project",
    description: "Fetches the workspace's project settings",
    icon: "🛠️",
    color: "#7E57C2"
  };

  constructor() {
    super(BaseGetProjectSettingsNode.metadata.title, BaseGetProjectSettingsNode.metadata.type);
    this.title = BaseGetProjectSettingsNode.metadata.title;
    this.size = [320, 140];

    this.addInput("onTrigger", LiteGraph.ACTION);

    this.addOutput("completed", LiteGraph.EVENT);
    this.addOutput("response", "object");
    this.addOutput("success", "boolean");
    this.addOutput("settings", "object");

    this.mode = LiteGraph.ON_TRIGGER;
  }
}
