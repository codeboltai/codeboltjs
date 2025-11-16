import { BaseOnChatNotificationNode } from '@agent-creator/shared-nodes';

// Frontend OnChatNotification Node - UI only
export class OnChatNotificationNode extends BaseOnChatNotificationNode {
  constructor() {
    super();
  }

  // Update notification when widget value changes
  onPropertyChanged(name: string, value: unknown, prev_value?: unknown): boolean {
    const result = super.onPropertyChanged(name, value, prev_value);
    return result;
  }
}