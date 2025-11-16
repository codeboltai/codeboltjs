import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base UserMessageRequest Node - Calls chat.UserMessageRequestNotify
export class BaseUserMessageRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/notifications/chat/usermessagerequest",
    title: "User Message Request",
    category: "codebolt/notifications/chat",
    description: "Sends a user message request notification",
    icon: "📤",
    color: "#2196F3"
  };

  constructor() {
    super(BaseUserMessageRequestNode.metadata.title, BaseUserMessageRequestNode.metadata.type);
    this.title = BaseUserMessageRequestNode.metadata.title;
    this.size = [240, 140];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs based on UserMessageRequestNotify parameters
    this.addInput("message", "string");
    this.addInput("payload", "object");
    this.addInput("toolUseId", "string");

    // Event output for request sent
    this.addOutput("requestSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  }