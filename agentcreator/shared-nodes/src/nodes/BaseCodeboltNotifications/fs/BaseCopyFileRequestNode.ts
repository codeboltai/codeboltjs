import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base CopyFileRequest Node - Calls fs.CopyFileRequestNotify
export class BaseCopyFileRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "notifications/fs/request/copyfile",
    title: "Copy File Request",
    category: "codebolt/notifications/fs",
    description: "Sends a copy file request notification",
    icon: "📋",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseCopyFileRequestNode.metadata.title, BaseCopyFileRequestNode.metadata.type);
    this.title = BaseCopyFileRequestNode.metadata.title;
    this.size = [240, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs based on CopyFileRequestNotify parameters
    this.addInput("sourceFile", "string");
    this.addInput("destinationFile", "string");
    this.addInput("toolUseId", "string");

    // Event output for request sent
    this.addOutput("requestSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  }