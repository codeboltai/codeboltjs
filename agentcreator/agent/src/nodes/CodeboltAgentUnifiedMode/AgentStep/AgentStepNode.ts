import { BaseAgentStepNode } from '@codebolt/agent-shared-nodes';
import { AgentStep } from '@codebolt/agent/unified';

// Backend-specific Agent Step Node - actual implementation
export class AgentStepNode extends BaseAgentStepNode {
  private agentStep: AgentStep | null = null;

  constructor() {
    super();
  }

  async onExecute() {
    try {
      const originalMessage = this.getInputData(1) as any;
      const processedMessage = this.getInputData(2) as any;
      const preInferenceProcessors = this.getInputData(3) as any[] || [];
      const postInferenceProcessors = this.getInputData(4) as any[] || [];

      // Validate inputs
      if (!originalMessage) {
        this.setOutputData(5, false);
        this.setOutputData(6, 'Error: Original message input is required');
        this.triggerSlot(1, null, null); // onError
        return;
      }

      if (!processedMessage) {
        this.setOutputData(5, false);
        this.setOutputData(6, 'Error: Processed message input is required');
        this.triggerSlot(1, null, null); // onError
        return;
      }

      // Create agent step instance
      this.agentStep = new AgentStep({
        preInferenceProcessors,
        postInferenceProcessors,
        llmRole: (this.properties.llmRole as string) || 'assistant'
      });

      // Execute the agent step
      const result = await this.agentStep.executeStep(originalMessage, processedMessage);

      // Update outputs with step result
      this.setOutputData(3, result); // result
      this.setOutputData(4, true); // success
      this.setOutputData(5, true); // success (duplicate output)
      this.setOutputData(6, null); // error

      // Trigger completion event
      this.triggerSlot(0, null, null); // onComplete

    } catch (error) {
      const errorMessage = `Error: Failed to execute agent step - ${error instanceof Error ? error.message : 'Unknown error'}`;
      this.setOutputData(4, false); // success
      this.setOutputData(5, false); // success (duplicate output)
      this.setOutputData(6, errorMessage); // error
      this.triggerSlot(1, null, null); // onError
      console.error('AgentStepNode error:', error);
    }
  }
}