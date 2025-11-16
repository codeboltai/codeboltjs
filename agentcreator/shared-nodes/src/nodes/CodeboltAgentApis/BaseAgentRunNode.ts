import { LGraphNode } from '@codebolt/litegraph';
import { NodeMetadata } from '../../types';

// Base class for Agent Run node
export class BaseAgentRunNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "agent/agent_run",
    title: "Agent Run",
    category: "agent",
    description: "Executes an agent with a task instruction",
    icon: "▶️",
    color: "#4CAF50"
  };
  constructor() {
    super(BaseAgentRunNode.metadata.title, BaseAgentRunNode.metadata.type);
    this.title = BaseAgentRunNode.metadata.title;
    this.properties = {
      timeout: 30000, // 30 seconds timeout
      retries: 1
    };

    this.addInput("Agent", "object");
    this.addInput("Task Instruction", "object");
    this.addOutput("Result", "object");
    this.addOutput("Message", "string");
    this.addOutput("Success", "boolean");
    this.addOutput("Error", "string");
    this.addOutput("Execution Time", "number");

    // Add widgets for UI
    this.addWidget("number", "Timeout (ms)", Number(this.properties.timeout), "onTimeoutChange", { min: 5000, max: 300000, step: 5000 });
    this.addWidget("number", "Retries", Number(this.properties.retries), "onRetriesChange", { min: 0, max: 5, step: 1 });
  }

  onTimeoutChange(value) {
    this.properties.timeout = parseInt(value);
  }

  onRetriesChange(value) {
    this.properties.retries = parseInt(value);
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
      // Execute agent (this would be implemented in backend)
      // const {message, success, error} = await agent.run(taskInstruction);

      // Mock execution for now
      const result = await this.executeAgent(agent, taskInstruction);

      const executionTime = Date.now() - startTime;

      this.setOutputData(0, result);
      this.setOutputData(1, (result as any).message || '');
      this.setOutputData(2, (result as any).success || false);
      this.setOutputData(3, (result as any).error || '');
      this.setOutputData(4, executionTime);

      console.log(`AgentRunNode ${this.id}: Execution completed in ${executionTime}ms`);

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

  // This method would be implemented in the backend node
  async executeAgent(agent, taskInstruction) {
    // Mock implementation - replace with actual agent.run() in backend
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Agent execution completed successfully',
          data: { result: 'mock result' }
        });
      }, 1000);
    });
  }
}