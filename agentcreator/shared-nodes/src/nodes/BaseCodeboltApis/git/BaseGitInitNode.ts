import { NodeMetadata } from '../../../types';
import { BaseGitNode } from './BaseGitNode';

export class BaseGitInitNode extends BaseGitNode {
  static metadata: NodeMetadata = {
    type: "codebolt/git/init",
    title: "Git Init",
    category: "codebolt/git",
    description: "Initializes a Git repository at the specified path",
    icon: "🌱",
    color: "#6A1B9A"
  };

  constructor() {
    super(BaseGitInitNode.metadata, [280, 150]);
    this.addProperty("path", "", "string");
    this.addInput("path", "string");
  }
}
