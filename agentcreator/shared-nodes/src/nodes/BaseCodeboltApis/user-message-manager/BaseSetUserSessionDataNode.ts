import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base SetUserSessionData Node - Calls userMessageManager.setSessionData()
export class BaseSetUserSessionDataNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/user-message-manager/setusersessiondata",
    title: "Set User Session Data",
    category: "codebolt/user-message-manager",
    description: "Sets session data in the user message manager",
    icon: "💾",
    color: "#795548"
  };

  constructor() {
    super(BaseSetUserSessionDataNode.metadata.title, BaseSetUserSessionDataNode.metadata.type);
    this.title = BaseSetUserSessionDataNode.metadata.title;
    this.size = [220, 100];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs
    this.addInput("key", "string");
    this.addInput("value", 0 as any); // Can be any type

    // Event output for dataSaved
    this.addOutput("dataSaved", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}