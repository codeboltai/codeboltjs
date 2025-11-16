import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetChatHistoryResult Node - Calls chat.GetChatHistoryResultNotify
export class BaseGetChatHistoryResultNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/notifications/chat/getchathistoryresult",
    title: "Get Chat History Result",
    category: "codebolt/notifications/chat",
    description: "Sends a chat history result notification",
    icon: "📊",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseGetChatHistoryResultNode.metadata.title, BaseGetChatHistoryResultNode.metadata.type);
    this.title = BaseGetChatHistoryResultNode.metadata.title;
    this.size = [240, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs based on GetChatHistoryResultNotify parameters
    this.addInput("content", "object");
    this.addInput("isError", "boolean");
    this.addInput("toolUseId", "string");

    // Event output for result sent
    this.addOutput("resultSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}