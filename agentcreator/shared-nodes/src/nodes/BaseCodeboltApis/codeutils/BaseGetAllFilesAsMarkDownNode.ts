import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetAllFilesAsMarkDown Node - Calls codebolt.codeutils.getAllFilesAsMarkDown
export class BaseGetAllFilesAsMarkDownNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/codeutils/getAllFilesAsMarkDown",
    title: "Get All Files as Markdown",
    category: "codebolt/codeutils",
    description: "Retrieves all files as Markdown content",
    icon: "📄",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseGetAllFilesAsMarkDownNode.metadata.title, BaseGetAllFilesAsMarkDownNode.metadata.type);
    this.title = BaseGetAllFilesAsMarkDownNode.metadata.title;
    this.size = [240, 80];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Event output for markdown retrieval completion
    this.addOutput("markdownRetrieved", LiteGraph.EVENT);

    // Output for markdown content
    this.addOutput("markdown", "string");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}