import { LGraphNode } from '@codebolt/litegraph';
import { NodeMetadata } from '../../types';

// Base class for UserMessage node
export class BaseUserMessageNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "agent/user_message",
    title: "User Message",
    category: "agent",
    description: "Creates a UserMessage with content and timestamp",
    icon: "💬",
    color: "#2196F3"
  };
  constructor() {
    super(BaseUserMessageNode.metadata.title, BaseUserMessageNode.metadata.type);
    this.title = BaseUserMessageNode.metadata.title;
    this.properties = {
      defaultMessage: ''
    };
    this.addInput("reqMessage", "string");
    this.addOutput("UserMessage", "object");
  }

  async onExecute() {
    const reqMessage = this.getInputData(0) || this.properties.defaultMessage;
    if (!reqMessage) {
      console.error('UserMessageNode: reqMessage input is required');
      return;
    }

    // Create UserMessage object
    const userMessage = {
      content: reqMessage,
      timestamp: new Date().toISOString(),
      type: 'user'
    };

    this.setOutputData(0, userMessage);
  }
}