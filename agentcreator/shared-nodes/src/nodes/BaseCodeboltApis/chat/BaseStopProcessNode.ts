import { NodeMetadata } from '../../../types';
import { BaseChatActionNode } from './BaseChatActionNode';

export class BaseStopProcessNode extends BaseChatActionNode {
  static metadata: NodeMetadata = {
    type: "codebolt/chat/stopProcess",
    title: "Stop Process",
    category: "codebolt/chat",
    description: "Signals chat process stopped",
    icon: "⏹️",
    color: "#03A9F4"
  };

  constructor() {
    super(BaseStopProcessNode.metadata, [240, 120]);
  }
}
