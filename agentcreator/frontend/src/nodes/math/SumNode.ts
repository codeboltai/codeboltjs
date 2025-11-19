import { BaseSumNode } from '@codebolt/agent-shared-nodes';

class SumNode extends BaseSumNode {
  constructor() {
    super();
  }

  // Frontend can override specific UI behaviors if needed
  // Otherwise it uses the default implementation from base class
}

SumNode.title = "Sum";

export default SumNode;