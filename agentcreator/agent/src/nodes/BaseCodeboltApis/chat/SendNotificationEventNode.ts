import { BaseSendNotificationEventNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitChatFailure, emitChatSuccess, getStringInput } from './utils.js';

export class SendNotificationEventNode extends BaseSendNotificationEventNode {
  constructor() {
    super();
  }

  async onExecute() {
    const message = getStringInput(this, 1, 'message');
    const eventType = getStringInput(this, 2, 'eventType', 'debug');

    if (!message) {
      emitChatFailure(this, 'Notification message is required');
      return;
    }

    try {
      await codebolt.chat.sendNotificationEvent(message, eventType as any);
      emitChatSuccess(this, { message, eventType });
    } catch (error) {
      emitChatFailure(this, 'Failed to send notification event', error);
    }
  }
}
