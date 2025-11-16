import { NodeMetadata } from '../../../types';
import { BaseGitNode } from './BaseGitNode';

export class BaseGitLogsNode extends BaseGitNode {
  static metadata: NodeMetadata = {
    type: "codebolt/git/logs",
    title: "Git Logs",
    category: "codebolt/git",
    description: "Retrieves commit logs for a repository",
    icon: "🧾",
    color: "#6A1B9A"
  };

  constructor() {
    super(BaseGitLogsNode.metadata, [300, 160]);
    this.addProperty("path", "", "string");
    this.addInput("path", "string");
  }
}
