import { NodeMetadata } from '../../../types';
import { BaseChatActionNode } from './BaseChatActionNode';

export class BaseProcessStartedNode extends BaseChatActionNode {
  static metadata: NodeMetadata = {
    type: "codebolt/chat/processStarted",
    title: "Process Started",
    category: "codebolt/chat",
    description: "Notifies chat that processing began",
    icon: "▶️",
    color: "#03A9F4"
  };

  constructor() {
    super(BaseProcessStartedNode.metadata, [280, 140]);
    this.addOutput("controller", "object");
  }
}
