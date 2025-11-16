import { NodeMetadata } from '../../../types';
import { BaseGitNode } from './BaseGitNode';

export class BaseGitBranchNode extends BaseGitNode {
  static metadata: NodeMetadata = {
    type: "codebolt/git/branch",
    title: "Git Branch",
    category: "codebolt/git",
    description: "Creates a new branch",
    icon: "🌿",
    color: "#6A1B9A"
  };

  constructor() {
    super(BaseGitBranchNode.metadata, [300, 160]);
    this.addProperty("branch", "", "string");
    this.addInput("branch", "string");
  }
}
