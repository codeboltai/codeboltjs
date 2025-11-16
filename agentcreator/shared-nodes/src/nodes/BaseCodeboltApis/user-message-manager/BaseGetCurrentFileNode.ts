import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetCurrentFile Node - Calls userMessageManager.getCurrentFile()
export class BaseGetCurrentFileNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/user-message-manager/getcurrentfile",
    title: "Get Current File",
    category: "codebolt/user-message-manager",
    description: "Gets the current file from the user message",
    icon: "📄",
    color: "#795548"
  };

  constructor() {
    super(BaseGetCurrentFileNode.metadata.title, BaseGetCurrentFileNode.metadata.type);
    this.title = BaseGetCurrentFileNode.metadata.title;
    this.size = [220, 80];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Event output for fileRetrieved
    this.addOutput("fileRetrieved", LiteGraph.EVENT);

    // Output for current file path
    this.addOutput("filePath", "string");

    // Output for has file boolean
    this.addOutput("hasFile", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}