import { NodeMetadata } from '../../../types';
import { BaseChatActionNode } from './BaseChatActionNode';

export class BaseProcessFinishedNode extends BaseChatActionNode {
  static metadata: NodeMetadata = {
    type: "codebolt/chat/processFinished",
    title: "Process Finished",
    category: "codebolt/chat",
    description: "Signals chat process finished",
    icon: "✅",
    color: "#03A9F4"
  };

  constructor() {
    super(BaseProcessFinishedNode.metadata, [240, 120]);
  }
}
