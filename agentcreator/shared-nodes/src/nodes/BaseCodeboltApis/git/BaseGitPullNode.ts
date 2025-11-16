import { NodeMetadata } from '../../../types';
import { BaseGitNode } from './BaseGitNode';

export class BaseGitPullNode extends BaseGitNode {
  static metadata: NodeMetadata = {
    type: "codebolt/git/pull",
    title: "Git Pull",
    category: "codebolt/git",
    description: "Fetches and merges remote changes",
    icon: "⬇️",
    color: "#6A1B9A"
  };

  constructor() {
    super(BaseGitPullNode.metadata);
  }
}
