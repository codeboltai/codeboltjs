import { BaseOnChatNotificationNode } from '@codebolt/agent-shared-nodes';
import { chatNotifications } from '@codebolt/codeboltjs';

export class OnChatNotificationNode extends BaseOnChatNotificationNode {
  private _notificationReceived = false;
  private _notificationHandler: ((data: any) => void) | null = null;

  constructor() {
    super();
    this._notificationReceived = false;
  }

  // Backend execution logic - waits for notification and triggers event
  async onExecute() {
    if (this._notificationReceived) {
      return;
    }

    this._notificationReceived = true;

    try {
      // For this implementation, we'll create a mock notification
      // In a real implementation, this would connect to the notification system
      const notification = this.createMockNotification();

      if (this.properties.showSplitOutputs) {
        this.setOutputData(1, notification.toolUseId || "");           // toolUseId
        this.setOutputData(2, notification.action || "");              // action
        this.setOutputData(3, notification.data || {});                // data
        this.setOutputData(4, notification.content || "");             // content
        this.setOutputData(5, notification.isError || false);          // isError
      } else {
        this.setOutputData(1, notification);
      }

      try {
        this.triggerSlot(0, null, null);
      } catch (triggerError) {
        console.error('[OnChatNotificationNode] triggerSlot failed:', triggerError);
      }
    } catch (error) {
      console.error('OnChatNotificationNode: Error in notification handling:', error);
    }
  }

  // Create a mock notification for demonstration
  private createMockNotification(): any {
    return {
      toolUseId: "mock-tool-use-id",
      action: "sendMessageRequest",
      data: {
        message: "Sample chat notification",
        timestamp: new Date().toISOString()
      },
      content: "This is a sample chat notification content",
      isError: false
    };
  }

  // Cleanup when node is removed
  onRemoved(): void {
    if (this._notificationHandler) {
      // Remove any event listeners if they were added
      this._notificationHandler = null;
    }
    super.onRemoved();
  }
}