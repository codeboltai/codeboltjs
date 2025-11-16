import { NodeMetadata } from '../../../types';
import { BaseGitNode } from './BaseGitNode';

export class BaseGitPushNode extends BaseGitNode {
  static metadata: NodeMetadata = {
    type: "codebolt/git/push",
    title: "Git Push",
    category: "codebolt/git",
    description: "Pushes local commits to the remote",
    icon: "⬆️",
    color: "#6A1B9A"
  };

  constructor() {
    super(BaseGitPushNode.metadata);
  }
}
