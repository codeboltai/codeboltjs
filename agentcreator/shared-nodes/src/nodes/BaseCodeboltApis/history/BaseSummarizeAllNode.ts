import { NodeMetadata } from '../../../types';
import { BaseHistoryActionNode } from './BaseHistoryActionNode';

export class BaseSummarizeAllNode extends BaseHistoryActionNode {
  static metadata: NodeMetadata = {
    type: "codebolt/history/summarizeAll",
    title: "Summarize All",
    category: "codebolt/history",
    description: "Generates a summary for the entire chat history",
    icon: "🧾",
    color: "#607D8B"
  };

  constructor() {
    super(BaseSummarizeAllNode.metadata, [320, 140]);
  }
}
