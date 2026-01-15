import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base SearchFiles Node - Calls cbfs.searchFiles
export class BaseSearchFilesNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/fs/searchfiles",
    title: "Search Files",
    category: "codebolt/fs",
    description: "Searches files in a given path using a regex pattern",
    icon: "🔍",
    color: "#607D8B"
  };

  constructor() {
    super(BaseSearchFilesNode.metadata.title, BaseSearchFilesNode.metadata.type);
    this.title = BaseSearchFilesNode.metadata.title;
    this.size = [220, 160];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs for file search
    this.addInput("path", "string");
    this.addInput("regex", "string");
    this.addInput("filePattern", "string");

    // Event output for filesSearched
    this.addOutput("filesSearched", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");

    // Output for search results
    this.addOutput("results", "array");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}