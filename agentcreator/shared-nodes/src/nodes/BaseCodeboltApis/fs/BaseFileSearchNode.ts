import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base FileSearch Node - Calls cbfs.fileSearch
export class BaseFileSearchNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/fs/filesearch",
    title: "File Search",
    category: "codebolt/fs",
    description: "Performs a fuzzy search for files",
    icon: "📝",
    color: "#607D8B"
  };

  constructor() {
    super(BaseFileSearchNode.metadata.title, BaseFileSearchNode.metadata.type);
    this.title = BaseFileSearchNode.metadata.title;
    this.size = [220, 100];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data input for file search
    this.addInput("query", "string");

    // Event output for searchCompleted
    this.addOutput("searchCompleted", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");

    // Output for search results
    this.addOutput("results", "array");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}