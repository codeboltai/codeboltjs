import { BaseGlobSearchRequestNode } from '@codebolt/agent-shared-nodes';
import { codeutilsNotifications } from '@codebolt/codeboltjs';

// Backend GlobSearchRequestNode - actual implementation
export class GlobSearchRequestNode extends BaseGlobSearchRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const pattern: any = this.getInputData(1);
    const basePath: any = this.getInputData(2);
    const maxDepth: any = this.getInputData(3);
    const includeDirectories: any = this.getInputData(4);
    const toolUseId: any = this.getInputData(5);

    // Validate required input
    if (!pattern || typeof pattern !== 'string' || !pattern.trim()) {
      const errorMessage = 'Error: Glob pattern is required and must be non-empty string';
      console.error('GlobSearchRequestNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    // Validate optional inputs
    if (basePath !== undefined && typeof basePath !== 'string') {
      const errorMessage = 'Error: basePath must be a string value';
      console.error('GlobSearchRequestNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    if (maxDepth !== undefined && (typeof maxDepth !== 'number' || maxDepth < 0)) {
      const errorMessage = 'Error: maxDepth must be a non-negative number';
      console.error('GlobSearchRequestNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    if (includeDirectories !== undefined && typeof includeDirectories !== 'boolean') {
      const errorMessage = 'Error: includeDirectories must be a boolean value';
      console.error('GlobSearchRequestNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    if (toolUseId !== undefined && typeof toolUseId !== 'string') {
      const errorMessage = 'Error: toolUseId must be a string value';
      console.error('GlobSearchRequestNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    try {
      codeutilsNotifications.GlobSearchRequestNotify(
        pattern,
        basePath,
        maxDepth,
        includeDirectories,
        toolUseId
      );

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send glob search request`;
      this.setOutputData(1, false);
      console.error('GlobSearchRequestNode error:', error);
    }
  }
}