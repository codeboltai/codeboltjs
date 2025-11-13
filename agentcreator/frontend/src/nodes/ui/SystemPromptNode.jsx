import React from 'react';
import { BaseSystemPromptNode } from '@agent-creator/shared-nodes';

// Frontend UI-specific SystemPrompt Node
export class SystemPromptNode extends BaseSystemPromptNode {
  constructor() {
    super();
    // Enhanced UI-specific properties
    this.properties = {
      ...this.properties,
      promptContent: 'You are a helpful AI assistant. Please respond to the user\'s message.',
      showPreview: true
    };

    // Enhanced UI widgets
    this.addWidget("text", "Prompt Content", this.properties.promptContent, "onPromptChange");
    this.addWidget("text", "File Path", this.properties.filePath, "onFilePathChange");
    this.addWidget("text", "Profile", this.properties.profile, "onProfileChange");
    this.addWidget("toggle", "Show Preview", this.properties.showPreview, "onPreviewToggle");
  }

  onPreviewToggle(value) {
    this.properties.showPreview = value;
    this.setDirtyCanvas(true);
  }

  // Frontend doesn't execute, just stores data for backend
  onExecute() {
    // Store the prompt data for later backend execution
    this.storedPrompt = {
      content: this.getInputData(0) || this.properties.promptContent,
      filePath: this.getInputData(1) || this.properties.filePath,
      profile: this.getInputData(2) || this.properties.profile
    };
  }

  // Override the base onExecute to provide UI feedback
  onDrawBackground(ctx) {
    if (this.flags.collapsed) return;

    // Draw status indicator
    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(0, 0, this.size[0], 2);

    // Draw preview if enabled
    if (this.properties.showPreview && this.storedPrompt && this.storedPrompt.content) {
      ctx.fillStyle = "#666";
      ctx.font = "10px Arial";
      const preview = this.storedPrompt.content.length > 30
        ? this.storedPrompt.content.substring(0, 30) + "..."
        : this.storedPrompt.content;
      ctx.fillText(preview, 10, this.size[1] - 5);
    }
  }

  getTitle() {
    return "System Prompt 📋";
  }
}