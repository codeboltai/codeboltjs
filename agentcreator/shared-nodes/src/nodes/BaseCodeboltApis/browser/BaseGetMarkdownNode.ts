import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetMarkdown Node - Calls codebolt.browser.getMarkdown
export class BaseGetMarkdownNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/browser/getMarkdown",
    title: "Get Markdown Content",
    category: "codebolt/browser",
    description: "Retrieves the Markdown content of the current page",
    icon: "📝",
    color: "#607D8B"
  };

  constructor() {
    super(BaseGetMarkdownNode.metadata.title, BaseGetMarkdownNode.metadata.type);
    this.title = BaseGetMarkdownNode.metadata.title;
    this.size = [220, 80];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Event output for Markdown retrieval completion
    this.addOutput("markdownRetrieved", LiteGraph.EVENT);

    // Output for Markdown content
    this.addOutput("markdown", "string");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}