import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base HasCurrentUserMessage Node - Calls userMessageManager.hasMessage()
export class BaseHasCurrentUserMessageNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/user-message-manager/hascurrentusermessage",
    title: "Has Current User Message",
    category: "codebolt/user-message-manager",
    description: "Checks if there is a current user message",
    icon: "❓",
    color: "#795548"
  };

  constructor() {
    super(BaseHasCurrentUserMessageNode.metadata.title, BaseHasCurrentUserMessageNode.metadata.type);
    this.title = BaseHasCurrentUserMessageNode.metadata.title;
    this.size = [240, 100];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Event output for checked
    this.addOutput("checked", LiteGraph.EVENT);

    // Output for has message boolean
    this.addOutput("hasMessage", "boolean");

    // Output for message timestamp
    this.addOutput("timestamp", "string");

    // Output for message ID
    this.addOutput("messageId", "string");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}