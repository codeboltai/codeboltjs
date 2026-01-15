import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base AppendToFileRequest Node - Calls fs.AppendToFileRequestNotify
export class BaseAppendToFileRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "notifications/fs/request/appendtofile",
    title: "Append To File Request",
    category: "codebolt/notifications/fs",
    description: "Sends an append to file request notification",
    icon: "➕",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseAppendToFileRequestNode.metadata.title, BaseAppendToFileRequestNode.metadata.type);
    this.title = BaseAppendToFileRequestNode.metadata.title;
    this.size = [240, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs based on AppendToFileRequestNotify parameters
    this.addInput("filePath", "string");
    this.addInput("text", "string");
    this.addInput("toolUseId", "string");

    // Event output for request sent
    this.addOutput("requestSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  }