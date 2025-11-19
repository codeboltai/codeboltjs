import { BaseAgentNode } from '@codebolt/agent-shared-nodes';
import { Agent } from '@codebolt/agent/unified';

// Backend-specific Agent Node - actual implementation
export class AgentNode extends BaseAgentNode {
  private agent: Agent | null = null;

  constructor() {
    super();
  }

  async onExecute() {
    try {
      const message = this.getInputData(1) as any;
      const agentConfig = this.getInputData(2) as any;

      // Validate inputs
      if (!message) {
        this.setOutputData(5, false);
        this.setOutputData(6, 'Error: Message input is required');
        this.triggerSlot(1, null, null); // onError
        return;
      }

      // Create agent configuration from properties and input
      const config = {
        ...agentConfig,
        name: (this.properties.agentName as string) || agentConfig?.name || 'Agent',
        instructions: (this.properties.instructions as string) || agentConfig?.instructions || 'You are a helpful assistant.',
        maxIterations: (this.properties.maxIterations as number) || agentConfig?.maxIterations || 10,
        maxConversationLength: (this.properties.maxConversationLength as number) || agentConfig?.maxConversationLength || 50,
        enableLogging: this.properties.enableLogging !== undefined ? (this.properties.enableLogging as boolean) : (agentConfig?.enableLogging ?? true)
      };

      // Create agent instance
      this.agent = new Agent(config);

      // Execute the agent
      const result = await this.agent.execute(message);

      // Update outputs with execution result
      this.setOutputData(3, result); // result
      this.setOutputData(4, result.success); // success
      this.setOutputData(5, result.success); // success (duplicate output)
      this.setOutputData(6, result.error || null); // error

      // Trigger appropriate event
      if (result.success) {
        this.triggerSlot(0, null, null); // onComplete
      } else {
        this.triggerSlot(1, null, null); // onError
      }

    } catch (error) {
      const errorMessage = `Error: Failed to execute agent - ${error instanceof Error ? error.message : 'Unknown error'}`;
      this.setOutputData(4, false); // success
      this.setOutputData(5, false); // success (duplicate output)
      this.setOutputData(6, errorMessage); // error
      this.triggerSlot(1, null, null); // onError
      console.error('AgentNode error:', error);
    }
  }
}