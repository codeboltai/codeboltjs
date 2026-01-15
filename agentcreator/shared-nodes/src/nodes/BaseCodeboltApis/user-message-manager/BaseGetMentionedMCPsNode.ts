import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetMentionedMCPs Node - Calls userMessageManager.getMentionedMCPs()
export class BaseGetMentionedMCPsNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/user-message-manager/getmentionedmcps",
    title: "Get Mentioned MCPs",
    category: "codebolt/user-message-manager",
    description: "Gets mentioned MCPs from the current user message",
    icon: "🔌",
    color: "#795548"
  };

  constructor() {
    super(BaseGetMentionedMCPsNode.metadata.title, BaseGetMentionedMCPsNode.metadata.type);
    this.title = BaseGetMentionedMCPsNode.metadata.title;
    this.size = [220, 80];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Event output for mcpsRetrieved
    this.addOutput("mcpsRetrieved", LiteGraph.EVENT);

    // Output for mentioned MCPs array
    this.addOutput("mcps", "array");

    // Output for count of mentioned MCPs
    this.addOutput("count", "number");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}