import { NodeMetadata } from '../../../types';
import { BaseGitNode } from './BaseGitNode';

export class BaseGitCommitNode extends BaseGitNode {
  static metadata: NodeMetadata = {
    type: "codebolt/git/commit",
    title: "Git Commit",
    category: "codebolt/git",
    description: "Commits staged changes with a message",
    icon: "💾",
    color: "#6A1B9A"
  };

  constructor() {
    super(BaseGitCommitNode.metadata, [300, 160]);
    this.addProperty("message", "", "string");
    this.addInput("message", "string");
  }
}
