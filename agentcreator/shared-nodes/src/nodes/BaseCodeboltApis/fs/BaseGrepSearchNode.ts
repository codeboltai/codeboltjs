import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GrepSearch Node - Calls cbfs.grepSearch
export class BaseGrepSearchNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/fs/grepsearch",
    title: "Grep Search",
    category: "codebolt/fs",
    description: "Performs a grep search in files",
    icon: "🔎",
    color: "#607D8B"
  };

  constructor() {
    super(BaseGrepSearchNode.metadata.title, BaseGrepSearchNode.metadata.type);
    this.title = BaseGrepSearchNode.metadata.title;
    this.size = [220, 180];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs for grep search
    this.addInput("path", "string");
    this.addInput("query", "string");
    this.addInput("includePattern", "string");
    this.addInput("excludePattern", "string");
    this.addInput("caseSensitive", "boolean");

    // Event output for grepCompleted
    this.addOutput("grepCompleted", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");

    // Output for search results
    this.addOutput("results", "array");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}