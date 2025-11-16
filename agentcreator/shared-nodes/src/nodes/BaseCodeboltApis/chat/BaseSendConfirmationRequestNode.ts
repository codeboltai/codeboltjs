import { NodeMetadata } from '../../../types';
import { BaseChatActionNode } from './BaseChatActionNode';

export class BaseSendConfirmationRequestNode extends BaseChatActionNode {
  static metadata: NodeMetadata = {
    type: "codebolt/chat/confirmationRequest",
    title: "Send Confirmation Request",
    category: "codebolt/chat",
    description: "Sends confirmation request with buttons",
    icon: "❓",
    color: "#03A9F4"
  };

  constructor() {
    super(BaseSendConfirmationRequestNode.metadata, [360, 200]);
    this.addProperty("message", "", "string");
    this.addProperty("buttons", "[]", "string");
    this.addProperty("withFeedback", false, "boolean");

    this.addInput("message", "string");
    this.addInput("buttons", "array");
    this.addInput("withFeedback", "boolean");

    this.addOutput("selection", "string");
  }
}
