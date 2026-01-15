import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base ClearUserMessage Node - Calls userMessageManager.clear()
export class BaseClearUserMessageNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/user-message-manager/clearusermessage",
    title: "Clear User Message",
    category: "codebolt/user-message-manager",
    description: "Clears all user message state",
    icon: "🗑️",
    color: "#795548"
  };

  constructor() {
    super(BaseClearUserMessageNode.metadata.title, BaseClearUserMessageNode.metadata.type);
    this.title = BaseClearUserMessageNode.metadata.title;
    this.size = [200, 80];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Event output for messageCleared
    this.addOutput("messageCleared", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}