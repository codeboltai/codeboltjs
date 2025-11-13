import React from 'react';
import { BaseTaskInstructionNode } from '@agent-creator/shared-nodes';

// Frontend UI-specific TaskInstruction Node
export class TaskInstructionNode extends BaseTaskInstructionNode {
  constructor() {
    super();
    // Enhanced UI-specific properties
    this.properties = {
      ...this.properties,
      taskContent: 'Please process the user message and provide a helpful response.',
      showInputs: true
    };

    // Enhanced UI widgets
    this.addWidget("text", "Task Content", this.properties.taskContent, "onTaskContentChange");
    this.addWidget("text", "File Path", this.properties.filePath, "onFilePathChange");
    this.addWidget("text", "Task Name", this.properties.taskName, "onTaskNameChange");
    this.addWidget("toggle", "Show Inputs", this.properties.showInputs, "onShowInputsToggle");
  }

  onShowInputsToggle(value) {
    this.properties.showInputs = value;
    this.setDirtyCanvas(true);
  }

  // Frontend doesn't execute, just stores data for backend
  onExecute() {
    // Store the task data for later backend execution
    this.storedTask = {
      taskContent: this.getInputData(2) || this.properties.taskContent,
      filePath: this.getInputData(3) || this.properties.filePath,
      taskName: this.getInputData(4) || this.properties.taskName
    };

    // Store connected inputs status
    this.hasAgentTools = !!this.getInputData(0);
    this.hasUserMessage = !!this.getInputData(1);
  }

  // Override the base onExecute to provide UI feedback
  onDrawBackground(ctx) {
    if (this.flags.collapsed) return;

    // Draw status indicator
    ctx.fillStyle = "#FF9800";
    ctx.fillRect(0, 0, this.size[0], 2);

    // Draw input status if enabled
    if (this.properties.showInputs) {
      ctx.fillStyle = "#666";
      ctx.font = "10px Arial";

      let yOffset = 15;
      ctx.fillText(`Task: ${this.storedTask?.taskName || 'Unknown'}`, 10, yOffset);

      yOffset += 15;
      ctx.fillText(`Tools: ${this.hasAgentTools ? '✓' : '✗'}`, 10, yOffset);

      yOffset += 15;
      ctx.fillText(`Message: ${this.hasUserMessage ? '✓' : '✗'}`, 10, yOffset);
    }
  }

  getTitle() {
    return "Task Instruction 📝";
  }
}