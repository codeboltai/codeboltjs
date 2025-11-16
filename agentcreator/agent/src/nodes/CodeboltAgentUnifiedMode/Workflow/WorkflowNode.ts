import { BaseWorkflowNode } from '@agent-creator/shared-nodes';
import { Workflow } from '@codebolt/agent/unified';

// Backend-specific Workflow Node - actual implementation
export class WorkflowNode extends BaseWorkflowNode {
  private workflow: Workflow | null = null;
  private executionId: string | null = null;

  constructor() {
    super();
  }

  async onExecute() {
    try {
      const workflowConfig = this.getInputData(1) as any;
      const data = this.getInputData(2) as any;

      // Validate inputs
      if (!workflowConfig) {
        this.setOutputData(7, false);
        this.setOutputData(10, 'Error: Workflow configuration is required');
        this.triggerSlot(3, null, null); // onError
        return;
      }

      // Create workflow instance
      this.workflow = new Workflow(workflowConfig);

      // Generate execution ID
      this.executionId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Update outputs with execution info
      this.setOutputData(6, this.executionId); // executionId
      this.setOutputData(7, true); // success
      this.setOutputData(8, ''); // currentStep (empty initially)
      this.setOutputData(9, {}); // stepResults (empty initially)
      this.setOutputData(10, null); // error

      // Trigger workflow start event
      this.triggerSlot(0, null, null); // onStart

      // Execute workflow asynchronously
      try {
        const result = this.workflow.execute();

        // Update outputs with final result
        this.setOutputData(3, result); // result
        this.setOutputData(7, result.success); // success
        this.setOutputData(8, 'completed'); // currentStep
        this.setOutputData(9, result.stepResults || {}); // stepResults
        this.setOutputData(10, result.error || null); // error

        // Trigger completion event
        this.triggerSlot(2, null, null); // onComplete

      } catch (workflowError) {
        const errorMessage = `Workflow execution failed: ${workflowError instanceof Error ? workflowError.message : 'Unknown error'}`;
        this.setOutputData(7, false); // success
        this.setOutputData(10, errorMessage); // error
        this.triggerSlot(3, null, null); // onError
      }

    } catch (error) {
      const errorMessage = `Error: Failed to execute workflow - ${error instanceof Error ? error.message : 'Unknown error'}`;
      this.setOutputData(7, false); // success
      this.setOutputData(10, errorMessage); // error
      this.triggerSlot(3, null, null); // onError
      console.error('WorkflowNode error:', error);
    }
  }
}