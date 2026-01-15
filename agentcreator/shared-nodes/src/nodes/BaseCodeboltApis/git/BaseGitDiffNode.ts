import { NodeMetadata } from '../../../types';
import { BaseGitNode } from './BaseGitNode';

export class BaseGitDiffNode extends BaseGitNode {
  static metadata: NodeMetadata = {
    type: "codebolt/git/diff",
    title: "Git Diff",
    category: "codebolt/git",
    description: "Retrieves the diff for a commit",
    icon: "🪓",
    color: "#6A1B9A"
  };

  constructor() {
    super(BaseGitDiffNode.metadata, [300, 160]);
    this.addProperty("commitHash", "", "string");
    this.addInput("commitHash", "string");
  }
}
