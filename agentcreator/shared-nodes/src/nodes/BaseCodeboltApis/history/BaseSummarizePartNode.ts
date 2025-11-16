import { NodeMetadata } from '../../../types';
import { BaseHistoryActionNode } from './BaseHistoryActionNode';

export class BaseSummarizePartNode extends BaseHistoryActionNode {
  static metadata: NodeMetadata = {
    type: "codebolt/history/summarizePart",
    title: "Summarize Part",
    category: "codebolt/history",
    description: "Summarizes specific messages with depth",
    icon: "📝",
    color: "#607D8B"
  };

  constructor() {
    super(BaseSummarizePartNode.metadata, [360, 200]);
    this.addProperty("messages", "[]", "string");
    this.addProperty("depth", 5, "number");
    this.addInput("messages", "array");
    this.addInput("depth", "number");
  }
}
