import { BaseAgentNode } from '@agent-creator/shared-nodes';

// Frontend UI-specific Agent Node
export class AgentNode extends BaseAgentNode {
  constructor() {
    super();
    // Enhanced UI-specific properties
    this.properties = {
      ...this.properties,
      agentConfig: {
        model: 'default',
        temperature: 0.7,
        maxTokens: 1000
      },
      showConfig: true,
      agentStatus: 'ready' // ready, running, completed, error
    };

    // Enhanced UI widgets
    this.addWidget("combo", "Model", this.properties.agentConfig.model, "onModelChange", {
      values: ['default', 'gpt-4', 'gpt-3.5', 'claude-3', 'claude-2']
    });
    this.addWidget("slider", "Temperature", this.properties.agentConfig.temperature, "onTemperatureChange", { min: 0, max: 2, step: 0.1 });
    this.addWidget("number", "Max Tokens", this.properties.agentConfig.maxTokens, "onMaxTokensChange", { min: 100, max: 4000, step: 100 });
    this.addWidget("toggle", "Show Config", this.properties.showConfig, "onShowConfigToggle");
  }

  onShowConfigToggle(value) {
    this.properties.showConfig = value;
    this.setDirtyCanvas(true);
  }

  // Frontend doesn't execute, just stores data for backend
  onExecute() {
    // Store the agent data for later backend execution
    this.storedAgent = {
      tools: this.getInputData(0),
      systemPrompt: this.getInputData(1),
      config: this.properties.agentConfig
    };

    // Update status based on connections
    this.hasTools = !!this.getInputData(0);
    this.hasSystemPrompt = !!this.getInputData(1);
  }

  // Override the base onExecute to provide UI feedback
  onDrawBackground(ctx) {
    if (this.flags.collapsed) return;

    // Draw status indicator based on agent status
    const statusColors = {
      ready: "#E91E63",
      running: "#FF9800",
      completed: "#4CAF50",
      error: "#F44336"
    };
    ctx.fillStyle = statusColors[this.properties.agentStatus] || "#E91E63";
    ctx.fillRect(0, 0, this.size[0], 2);

    // Draw configuration if enabled
    if (this.properties.showConfig) {
      ctx.fillStyle = "#666";
      ctx.font = "10px Arial";

      let yOffset = 15;
      ctx.fillText(`Model: ${this.properties.agentConfig.model}`, 10, yOffset);

      yOffset += 15;
      ctx.fillText(`Temp: ${this.properties.agentConfig.temperature}`, 10, yOffset);

      yOffset += 15;
      ctx.fillText(`Tokens: ${this.properties.agentConfig.maxTokens}`, 10, yOffset);

      yOffset += 15;
      ctx.fillText(`Tools: ${this.hasTools ? '✓' : '✗'}`, 10, yOffset);

      yOffset += 15;
      ctx.fillText(`Prompt: ${this.hasSystemPrompt ? '✓' : '✗'}`, 10, yOffset);
    }

    // Draw agent icon
    ctx.font = "20px Arial";
    ctx.fillText("🤖", this.size[0] - 25, 20);
  }

  getTitle() {
    return "Agent 🤖";
  }

  // Update agent status (called by backend execution result)
  updateStatus(status) {
    this.properties.agentStatus = status;
    this.setDirtyCanvas(true);
  }
}