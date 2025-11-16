import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetCurrentUserMessage Node - Calls userMessageManager.getMessage()
export class BaseGetCurrentUserMessageNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/user-message-manager/getcurrentusermessage",
    title: "Get Current User Message",
    category: "codebolt/user-message-manager",
    description: "Gets the current user message from the message manager",
    icon: "📨",
    color: "#795548"
  };

  constructor() {
    super(BaseGetCurrentUserMessageNode.metadata.title, BaseGetCurrentUserMessageNode.metadata.type);
    this.title = BaseGetCurrentUserMessageNode.metadata.title;
    this.size = [240, 80];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Event output for messageRetrieved
    this.addOutput("messageRetrieved", LiteGraph.EVENT);

    // Output for current message object
    this.addOutput("message", "object");

    // Output for has message boolean
    this.addOutput("hasMessage", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}