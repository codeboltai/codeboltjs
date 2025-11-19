import { BasePerformMatchNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific PerformMatch Node - actual implementation
export class PerformMatchNode extends BasePerformMatchNode {
  constructor() {
    super();
  }

  async onExecute() {
    const matcherDefinition = this.getInputData(1) as any;
    const problemPatterns = (this.getInputData(2) || []) as any[];
    const problems = this.getInputData(3) as any[];

    if (!matcherDefinition || typeof matcherDefinition !== 'object') {
      const errorMessage = 'Error: Matcher definition is required and must be an object';
      console.error('PerformMatchNode error:', errorMessage);
      this.setOutputData(2, false);
      this.setOutputData(1, null);
      return;
    }

    if (!Array.isArray(problemPatterns) || problemPatterns.length === 0) {
      const errorMessage = 'Error: Problem patterns array is required and cannot be empty';
      console.error('PerformMatchNode error:', errorMessage);
      this.setOutputData(2, false);
      this.setOutputData(1, null);
      return;
    }

    try {
      const result = await codebolt.codeutils.performMatch(matcherDefinition, problemPatterns, problems);

      // Update outputs with success results
      this.setOutputData(1, result);
      this.setOutputData(2, true);

      // Trigger the matchCompleted event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error performing code match: ${error}`;
      this.setOutputData(1, null);
      this.setOutputData(2, false);
      console.error('PerformMatchNode error:', error);
    }
  }
}