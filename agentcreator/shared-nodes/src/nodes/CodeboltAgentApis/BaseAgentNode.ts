import { LGraphNode } from '@codebolt/litegraph';
import { NodeMetadata } from '../../utils';

// Base class for Agent node
export class BaseAgentNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "agent/agent",
    title: "Agent",
    category: "agent",
    description: "Creates an Agent with tools and system prompt",
    icon: "🤖",
    color: "#E91E63"
  };
  constructor() {
    super(BaseAgentNode.metadata.title, BaseAgentNode.metadata.type);
    this.title = BaseAgentNode.metadata.title;
    this.properties = {
      agentConfig: {
        model: 'default',
        temperature: 0.7,
        maxTokens: 1000
      }
    };

    this.addInput("Agent Tools", "array");
    this.addInput("System Prompt", "object");
    this.addOutput("Agent", "object");

    // Add widgets for UI
    this.addWidget("combo", "Model", this.properties.agentConfig.model, "onModelChange", { values: ['default', 'gpt-4', 'gpt-3.5', 'claude'] });
    this.addWidget("number", "Temperature", this.properties.agentConfig.temperature, "onTemperatureChange", { min: 0, max: 2, step: 0.1 });
    this.addWidget("number", "Max Tokens", this.properties.agentConfig.maxTokens, "onMaxTokensChange", { min: 100, max: 4000, step: 100 });
  }

  onModelChange(value) {
    this.properties.agentConfig.model = value;
  }

  onTemperatureChange(value) {
    this.properties.agentConfig.temperature = parseFloat(value);
  }

  onMaxTokensChange(value) {
    this.properties.agentConfig.maxTokens = parseInt(value);
  }

  async onExecute() {
    const agentTools = this.getInputData(0);
    const systemPrompt = this.getInputData(1);

    if (!agentTools || !systemPrompt) {
      console.error('AgentNode: Agent Tools and System Prompt inputs are required');
      return;
    }

    // Create Agent object
    const agent = {
      tools: agentTools,
      systemPrompt: systemPrompt,
      config: this.properties.agentConfig,
      type: 'agent',
      id: this.id
    };

    this.setOutputData(0, agent);
  }
}