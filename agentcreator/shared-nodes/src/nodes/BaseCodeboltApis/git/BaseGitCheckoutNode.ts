import { NodeMetadata } from '../../../types';
import { BaseGitNode } from './BaseGitNode';

export class BaseGitCheckoutNode extends BaseGitNode {
  static metadata: NodeMetadata = {
    type: "codebolt/git/checkout",
    title: "Git Checkout",
    category: "codebolt/git",
    description: "Checks out a branch or commit",
    icon: "🔀",
    color: "#6A1B9A"
  };

  constructor() {
    super(BaseGitCheckoutNode.metadata, [300, 160]);
    this.addProperty("branch", "", "string");
    this.addInput("branch", "string");
  }
}
