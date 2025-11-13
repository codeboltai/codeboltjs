import { BaseAgentNode } from '@agent-creator/shared-nodes';

// Backend-specific Agent Node - execution logic with actual Codebolt integration
export class AgentNode extends BaseAgentNode {
  constructor() {
    super();
    // Backend doesn't need UI widgets
  }

  async onExecute() {
    const agentTools = this.getInputData(0);
    const systemPrompt = this.getInputData(1);

    if (!agentTools || !systemPrompt) {
      console.error('AgentNode: Agent Tools and System Prompt inputs are required');
      this.setOutputData(0, null);
      return;
    }

    try {
      // Import and use actual Agent class from @codebolt/utils
      const { Agent } = require("@codebolt/utils");

      // Create actual Agent instance - exactly as in your example
      const agent = new Agent(agentTools, systemPrompt);

      // Add metadata for tracking (optional)
      agent.nodeId = this.id;
      agent.nodeType = 'agent';

      this.setOutputData(0, agent);
      // console.log(`AgentNode ${this.id}: Created Agent instance with tools`);
    } catch (error) {
      console.error(`AgentNode ${this.id}: Error creating Agent:`, error);
      this.setOutputData(0, null);
    }
  }
}