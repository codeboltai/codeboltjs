import { BaseAgentRunNode } from '@agent-creator/shared-nodes';

// Backend-specific Agent Run Node - execution logic with actual Codebolt integration
export class AgentRunNode extends BaseAgentRunNode {
  constructor() {
    super();
    // Backend doesn't need UI widgets
  }

  async onExecute() {
    const agent = this.getInputData(0);
    const taskInstruction = this.getInputData(1);

    if (!agent || !taskInstruction) {
      console.error('AgentRunNode: Agent and Task Instruction inputs are required');
      this.setOutputData(0, { success: false, error: 'Missing required inputs' });
      this.setOutputData(1, '');
      this.setOutputData(2, false);
      this.setOutputData(3, 'Missing required inputs');
      this.setOutputData(4, 0);
      return;
    }

    const startTime = Date.now();

    try {
      // console.log(`AgentRunNode ${this.id}: Starting agent execution...`);

      // Execute the agent exactly as in your example: agent.run(task)
      const { message, success, error } = await agent.run(taskInstruction);

      const executionTime = Date.now() - startTime;

      // Create result object matching your example pattern
      const result = {
        message: message || null,
        success: success || false,
        error: error || null
      };

      this.setOutputData(0, result);
      this.setOutputData(1, message || '');
      this.setOutputData(2, success || false);
      this.setOutputData(3, error || '');
      this.setOutputData(4, executionTime);

      // console.log(`AgentRunNode ${this.id}: Execution completed in ${executionTime}ms. Success: ${success}`);

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorResult = {
        success: false,
        error: error.message,
        executionTime: executionTime
      };

      this.setOutputData(0, errorResult);
      this.setOutputData(1, '');
      this.setOutputData(2, false);
      this.setOutputData(3, error.message);
      this.setOutputData(4, executionTime);

      console.error(`AgentRunNode ${this.id}: Execution failed:`, error);
    }
  }
}