import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetUploadedImages Node - Calls userMessageManager.getUploadedImages()
export class BaseGetUploadedImagesNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/user-message-manager/getuploadedimages",
    title: "Get Uploaded Images",
    category: "codebolt/user-message-manager",
    description: "Gets uploaded images from the current user message",
    icon: "🖼️",
    color: "#795548"
  };

  constructor() {
    super(BaseGetUploadedImagesNode.metadata.title, BaseGetUploadedImagesNode.metadata.type);
    this.title = BaseGetUploadedImagesNode.metadata.title;
    this.size = [220, 80];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Event output for imagesRetrieved
    this.addOutput("imagesRetrieved", LiteGraph.EVENT);

    // Output for uploaded images array
    this.addOutput("images", "array");

    // Output for count of uploaded images
    this.addOutput("count", "number");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}