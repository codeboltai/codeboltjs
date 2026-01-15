import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base PdfToText Node - Calls codebolt.browser.pdfToText
export class BasePdfToTextNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/browser/pdfToText",
    title: "PDF to Text",
    category: "codebolt/browser",
    description: "Converts the PDF content of the current page to text",
    icon: "📖",
    color: "#795548"
  };

  constructor() {
    super(BasePdfToTextNode.metadata.title, BasePdfToTextNode.metadata.type);
    this.title = BasePdfToTextNode.metadata.title;
    this.size = [160, 60];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Note: pdfToText is void function - doesn't return a promise
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}