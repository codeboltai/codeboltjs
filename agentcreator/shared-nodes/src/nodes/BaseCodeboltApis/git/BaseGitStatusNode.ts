import { NodeMetadata } from '../../../types';
import { BaseGitNode } from './BaseGitNode';

export class BaseGitStatusNode extends BaseGitNode {
  static metadata: NodeMetadata = {
    type: "codebolt/git/status",
    title: "Git Status",
    category: "codebolt/git",
    description: "Retrieves repository status information",
    icon: "ℹ️",
    color: "#6A1B9A"
  };

  constructor() {
    super(BaseGitStatusNode.metadata);
  }
}
