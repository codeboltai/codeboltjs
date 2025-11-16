import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base ExtractText Node - Calls codebolt.browser.extractText
export class BaseExtractTextNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/browser/extractText",
    title: "Extract Text",
    category: "codebolt/browser",
    description: "Extracts text from the current page",
    icon: "📄",
    color: "#FFC107"
  };

  constructor() {
    super(BaseExtractTextNode.metadata.title, BaseExtractTextNode.metadata.type);
    this.title = BaseExtractTextNode.metadata.title;
    this.size = [180, 80];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Event output for text extraction completion
    this.addOutput("textExtracted", LiteGraph.EVENT);

    // Output for extracted text
    this.addOutput("text", "string");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}