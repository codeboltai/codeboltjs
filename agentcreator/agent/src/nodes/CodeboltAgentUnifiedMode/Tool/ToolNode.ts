import { BaseToolNode } from '@codebolt/agent-shared-nodes';
import { Tool } from '@codebolt/agent/unified';

// Backend-specific Tool Node - actual implementation
export class ToolNode extends BaseToolNode {
  private tool: Tool | null = null;

  constructor() {
    super();
  }

  async onExecute() {
    try {
      const toolConfig = this.getInputData(1) as any;
      const input = this.getInputData(2) as any;
      const context = this.getInputData(3) as any;

      // If we have a tool config, create the tool
      if (toolConfig) {
        // Create tool with configuration
        this.tool = new Tool({
          ...toolConfig,
          id: (this.properties.toolId as string) || toolConfig.id || 'custom_tool',
          description: (this.properties.toolDescription as string) || toolConfig.description || 'A custom tool for specific tasks'
        });

        // Update outputs with created tool
        this.setOutputData(4, this.tool); // tool
        this.setOutputData(5, this.tool.toOpenAITool()); // openAITool
        this.setOutputData(7, true); // success
        this.setOutputData(8, null); // error

        // Trigger creation event
        this.triggerSlot(0, null, null); // onCreated
      }

      // If we have input data, execute the tool
      if (input && this.tool) {
        // Execute the tool
        const result = await this.tool.execute(input, context);

        // Update outputs with execution result
        this.setOutputData(6, result); // result
        this.setOutputData(7, result.success); // success
        this.setOutputData(8, result.error || null); // error

        // Trigger execution event
        if (result.success) {
          this.triggerSlot(1, null, null); // onExecuted
        } else {
          this.triggerSlot(2, null, null); // onError
        }
      }

    } catch (error) {
      const errorMessage = `Error: Failed to create/execute tool - ${error instanceof Error ? error.message : 'Unknown error'}`;
      this.setOutputData(7, false); // success
      this.setOutputData(8, errorMessage); // error
      this.triggerSlot(2, null, null); // onError
      console.error('ToolNode error:', error);
    }
  }
}