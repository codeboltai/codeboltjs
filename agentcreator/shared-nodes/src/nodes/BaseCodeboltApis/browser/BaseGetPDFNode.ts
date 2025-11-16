import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetPDF Node - Calls codebolt.browser.getPDF
export class BaseGetPDFNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/browser/getPDF",
    title: "Get PDF Content",
    category: "codebolt/browser",
    description: "Retrieves the PDF content of the current page",
    icon: "📄",
    color": "#F44336"
  };

  constructor() {
    super(BaseGetPDFNode.metadata.title, BaseGetPDFNode.metadata.type);
    this.title = BaseGetPDFNode.metadata.title;
    this.size = [180, 60];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Note: getPDF is void function - doesn't return a promise
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}