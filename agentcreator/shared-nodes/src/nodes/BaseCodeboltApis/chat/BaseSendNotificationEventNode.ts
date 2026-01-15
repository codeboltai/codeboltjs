import { NodeMetadata } from '../../../types';
import { BaseChatActionNode } from './BaseChatActionNode';

export class BaseSendNotificationEventNode extends BaseChatActionNode {
  static metadata: NodeMetadata = {
    type: "codebolt/chat/sendNotification",
    title: "Send Notification Event",
    category: "codebolt/chat",
    description: "Sends a notification event message",
    icon: "🔔",
    color: "#03A9F4"
  };

  constructor() {
    super(BaseSendNotificationEventNode.metadata, [340, 160]);
    this.addProperty("message", "", "string");
    this.addProperty("eventType", "debug", "string");

    this.addInput("message", "string");
    this.addInput("eventType", "string");
  }
}
