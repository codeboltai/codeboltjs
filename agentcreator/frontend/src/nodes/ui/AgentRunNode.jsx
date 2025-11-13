import React from 'react';
import { BaseAgentRunNode } from '@agent-creator/shared-nodes';

// Frontend UI-specific Agent Run Node
export class AgentRunNode extends BaseAgentRunNode {
  constructor() {
    super();
    // Enhanced UI-specific properties
    this.properties = {
      ...this.properties,
      timeout: 30000,
      retries: 1,
      showProgress: true,
      lastResult: null,
      executionStatus: 'idle' // idle, running, completed, error
    };

    // Enhanced UI widgets
    this.addWidget("number", "Timeout (ms)", this.properties.timeout, "onTimeoutChange", { min: 5000, max: 300000, step: 5000 });
    this.addWidget("number", "Retries", this.properties.retries, "onRetriesChange", { min: 0, max: 5, step: 1 });
    this.addWidget("toggle", "Show Progress", this.properties.showProgress, "onShowProgressToggle");

    // Add execute button widget
    this.addWidget("button", "Execute Agent", null, "onExecuteAgent");
  }

  onShowProgressToggle(value) {
    this.properties.showProgress = value;
    this.setDirtyCanvas(true);
  }

  onExecuteAgent() {
    // Trigger graph execution when button is clicked
    if (this.graph && this.graph.start) {
      this.properties.executionStatus = 'running';
      this.setDirtyCanvas(true);

      // Start graph execution
      this.graph.start();

      // Reset status after a delay
      setTimeout(() => {
        this.properties.executionStatus = 'idle';
        this.setDirtyCanvas(true);
      }, 2000);
    }
  }

  // Frontend doesn't execute, just stores data for backend
  onExecute() {
    // Store the execution data for later backend execution
    this.storedExecution = {
      agent: this.getInputData(0),
      taskInstruction: this.getInputData(1)
    };

    // Update connection status
    this.hasAgent = !!this.getInputData(0);
    this.hasTask = !!this.getInputData(1);
  }

  // Update execution result (called by backend execution result)
  updateExecutionResult(result) {
    this.properties.lastResult = result;
    this.properties.executionStatus = result?.success ? 'completed' : 'error';
    this.setDirtyCanvas(true);
  }

  // Override the base onExecute to provide UI feedback
  onDrawBackground(ctx) {
    if (this.flags.collapsed) return;

    // Draw status indicator based on execution status
    const statusColors = {
      idle: "#4CAF50",
      running: "#FF9800",
      completed: "#4CAF50",
      error: "#F44336"
    };
    ctx.fillStyle = statusColors[this.properties.executionStatus] || "#4CAF50";
    ctx.fillRect(0, 0, this.size[0], 2);

    // Draw progress if enabled
    if (this.properties.showProgress) {
      ctx.fillStyle = "#666";
      ctx.font = "10px Arial";

      let yOffset = 15;
      ctx.fillText(`Agent: ${this.hasAgent ? '✓' : '✗'}`, 10, yOffset);

      yOffset += 15;
      ctx.fillText(`Task: ${this.hasTask ? '✓' : '✗'}`, 10, yOffset);

      yOffset += 15;
      ctx.fillText(`Status: ${this.properties.executionStatus}`, 10, yOffset);

      // Draw last result if available
      if (this.properties.lastResult) {
        yOffset += 15;
        const resultText = this.properties.lastResult.success ? '✓ Success' : '✗ Error';
        ctx.fillText(`Result: ${resultText}`, 10, yOffset);

        if (this.properties.lastResult.message) {
          yOffset += 15;
          const messagePreview = this.properties.lastResult.message.length > 20
            ? this.properties.lastResult.message.substring(0, 20) + "..."
            : this.properties.lastResult.message;
          ctx.fillText(messagePreview, 10, yOffset);
        }
      }
    }

    // Draw execution icon
    ctx.font = "20px Arial";
    const icons = {
      idle: "▶️",
      running: "⏳",
      completed: "✅",
      error: "❌"
    };
    ctx.fillText(icons[this.properties.executionStatus] || "▶️", this.size[0] - 25, 20);
  }

  getTitle() {
    return "Agent Run ▶️";
  }
}