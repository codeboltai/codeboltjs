import { BaseResponseExecutorNode } from '@agent-creator/shared-nodes';
import { ResponseExecutor } from '@codebolt/unified';

// Backend-specific Response Executor Node - actual implementation
export class ResponseExecutorNode extends BaseResponseExecutorNode {
  private responseExecutor: ResponseExecutor | null = null;

  constructor() {
    super();
  }

  async onExecute() {
    try {
      const responseInput = this.getInputData(1) as any;
      const preToolCallProcessors = this.getInputData(2) as any[] || [];
      const postToolCallProcessors = this.getInputData(3) as any[] || [];

      // Validate inputs
      if (!responseInput) {
        this.setOutputData(6, false);
        this.setOutputData(9, 'Error: Response input is required');
        this.triggerSlot(2, null, null); // onError
        return;
      }

      // Create response executor instance
      this.responseExecutor = new ResponseExecutor({
        preToolCallProcessors,
        postToolCallProcessors
      });

      // Execute the response
      const result = await this.responseExecutor.executeResponse(responseInput);

      // Update outputs with response result
      this.setOutputData(3, result); // result
      this.setOutputData(4, result.toolResults || []); // toolResults
      this.setOutputData(5, result.completed); // completed
      this.setOutputData(6, true); // success
      this.setOutputData(7, true); // success (duplicate output)
      this.setOutputData(8, null); // error

      // Trigger appropriate events
      if (result.toolResults && result.toolResults.length > 0) {
        this.triggerSlot(1, null, null); // onToolsComplete
      }
      this.triggerSlot(0, null, null); // onComplete

    } catch (error) {
      const errorMessage = `Error: Failed to execute response - ${error instanceof Error ? error.message : 'Unknown error'}`;
      this.setOutputData(6, false); // success
      this.setOutputData(7, false); // success (duplicate output)
      this.setOutputData(8, errorMessage); // error
      this.triggerSlot(2, null, null); // onError
      console.error('ResponseExecutorNode error:', error);
    }
  }
}