import { NodeMetadata } from '../../../types';
import { BaseGitNode } from './BaseGitNode';

export class BaseGitAddNode extends BaseGitNode {
  static metadata: NodeMetadata = {
    type: "codebolt/git/addall",
    title: "Git Add All",
    category: "codebolt/git",
    description: "Stages all changes in the repository",
    icon: "➕",
    color: "#6A1B9A"
  };

  constructor() {
    super(BaseGitAddNode.metadata);
  }
}
