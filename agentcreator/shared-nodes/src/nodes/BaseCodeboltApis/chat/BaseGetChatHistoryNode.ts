import { NodeMetadata } from '../../../types';
import { BaseChatActionNode } from './BaseChatActionNode';

export class BaseGetChatHistoryNode extends BaseChatActionNode {
  static metadata: NodeMetadata = {
    type: "codebolt/chat/getHistory",
    title: "Get Chat History",
    category: "codebolt/chat",
    description: "Loads chat history for a thread",
    icon: "🕰️",
    color: "#03A9F4"
  };

  constructor() {
    super(BaseGetChatHistoryNode.metadata, [320, 160]);
    this.addProperty("threadId", "", "string");
    this.addInput("threadId", "string");
    this.addOutput("history", "array");
  }
}
