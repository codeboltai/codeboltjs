import { BaseGrepSearchNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific GrepSearch Node - actual implementation
export class GrepSearchNode extends BaseGrepSearchNode {
  constructor() {
    super();
  }

  async onExecute() {
    const path = this.getInputData(1) as string;
    const query = this.getInputData(2) as string;
    const includePattern = this.getInputData(3) as string;
    const excludePattern = this.getInputData(4) as string;
    const caseSensitive = this.getInputData(5) as boolean || true;

    if (!path || !query) {
      console.error('GrepSearchNode error: Missing required inputs (path, query)');
      this.setOutputData(1, false);
      this.setOutputData(2, null);
      return;
    }

    try {
      const result = await codebolt.fs.grepSearch(
        path,
        query,
        includePattern,
        excludePattern,
        caseSensitive
      );
      this.setOutputData(1, true);
      this.setOutputData(2, result.matches || null);
      this.triggerSlot(0, null, null);
    } catch (error) {
      console.error('GrepSearchNode error:', error);
      this.setOutputData(1, false);
      this.setOutputData(2, null);
    }
  }
}