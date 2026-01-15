import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetMentionedFiles Node - Calls userMessageManager.getMentionedFiles()
export class BaseGetMentionedFilesNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/user-message-manager/getmentionedfiles",
    title: "Get Mentioned Files",
    category: "codebolt/user-message-manager",
    description: "Gets mentioned files from the current user message",
    icon: "📁",
    color: "#795548"
  };

  constructor() {
    super(BaseGetMentionedFilesNode.metadata.title, BaseGetMentionedFilesNode.metadata.type);
    this.title = BaseGetMentionedFilesNode.metadata.title;
    this.size = [220, 80];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Event output for filesRetrieved
    this.addOutput("filesRetrieved", LiteGraph.EVENT);

    // Output for mentioned files array
    this.addOutput("files", "array");

    // Output for count of mentioned files
    this.addOutput("count", "number");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}