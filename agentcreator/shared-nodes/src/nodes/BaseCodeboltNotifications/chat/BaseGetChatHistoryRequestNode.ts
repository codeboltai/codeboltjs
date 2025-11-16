import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetChatHistoryRequest Node - Calls chat.GetChatHistoryRequestNotify
export class BaseGetChatHistoryRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/notifications/chat/getchathistoryrequest",
    title: "Get Chat History Request",
    category: "codebolt/notifications/chat",
    description: "Sends a chat history request notification",
    icon: "📋",
    color: "#2196F3"
  };

  constructor() {
    super(BaseGetChatHistoryRequestNode.metadata.title, BaseGetChatHistoryRequestNode.metadata.type);
    this.title = BaseGetChatHistoryRequestNode.metadata.title;
    this.size = [240, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs based on GetChatHistoryRequestNotify parameters
    this.addInput("data", "object");
    this.addInput("toolUseId", "string");

    // Event output for request sent
    this.addOutput("requestSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}