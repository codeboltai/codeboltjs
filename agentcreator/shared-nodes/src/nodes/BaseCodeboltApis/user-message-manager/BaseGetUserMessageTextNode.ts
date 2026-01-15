import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetUserMessageText Node - Calls userMessageManager.getMessageText()
export class BaseGetUserMessageTextNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/user-message-manager/getusermessagetext",
    title: "Get User Message Text",
    category: "codebolt/user-message-manager",
    description: "Gets the text content of the current user message",
    icon: "📝",
    color: "#795548"
  };

  constructor() {
    super(BaseGetUserMessageTextNode.metadata.title, BaseGetUserMessageTextNode.metadata.type);
    this.title = BaseGetUserMessageTextNode.metadata.title;
    this.size = [220, 80];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Event output for textRetrieved
    this.addOutput("textRetrieved", LiteGraph.EVENT);

    // Output for message text
    this.addOutput("text", "string");

    // Output for has text boolean
    this.addOutput("hasText", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}