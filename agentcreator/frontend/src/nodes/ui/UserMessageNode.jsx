import React from 'react';
import { BaseUserMessageNode } from '@agent-creator/shared-nodes';

// Frontend UI-specific UserMessage Node
export class UserMessageNode extends BaseUserMessageNode {
  constructor() {
    super();
    // Add UI-specific properties
    this.properties = {
      ...this.properties,
      defaultMessage: 'Hello, how can I help you?'
    };

    // Add UI widgets
    this.addWidget("text", "Default Message", this.properties.defaultMessage, "onDefaultMessageChange");
  }

  onDefaultMessageChange(value) {
    this.properties.defaultMessage = value;
  }

  // Frontend doesn't execute, just stores data for backend
  onExecute() {
    // Store the message for later backend execution
    this.storedMessage = this.getInputData(0) || this.properties.defaultMessage;
  }

  // Override the base onExecute to provide UI feedback
  onDrawBackground(ctx) {
    if (this.flags.collapsed) return;

    // Draw status indicator
    ctx.fillStyle = "#2196F3";
    ctx.fillRect(0, 0, this.size[0], 2);

    // Draw message preview if available
    if (this.storedMessage) {
      ctx.fillStyle = "#666";
      ctx.font = "11px Arial";
      const preview = this.storedMessage.length > 20
        ? this.storedMessage.substring(0, 20) + "..."
        : this.storedMessage;
      ctx.fillText(preview, 10, this.size[1] - 5);
    }
  }

  getTitle() {
    return "User Message 💬";
  }
}