import { NodeMetadata } from '../../../types';
import { BaseChatActionNode } from './BaseChatActionNode';

export class BaseWaitForReplyNode extends BaseChatActionNode {
  static metadata: NodeMetadata = {
    type: "codebolt/chat/waitForReply",
    title: "Wait For Reply",
    category: "codebolt/chat",
    description: "Waits for a chat reply message",
    icon: "⏳",
    color: "#03A9F4"
  };

  constructor() {
    super(BaseWaitForReplyNode.metadata, [320, 160]);
    this.addProperty("message", "", "string");
    this.addInput("message", "string");
    this.addOutput("reply", "object");
  }
}
