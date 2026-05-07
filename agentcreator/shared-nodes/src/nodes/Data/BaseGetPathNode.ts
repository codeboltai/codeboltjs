import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../types';

export class BaseGetPathNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "data/getPath",
    title: "Get Path",
    category: "data",
      description: "Extracts a nested value from an object or array using dot/bracket paths",
    icon: ".",
    color: "#607D8B"
  };

  constructor() {
    super(BaseGetPathNode.metadata.title, BaseGetPathNode.metadata.type);
    this.title = BaseGetPathNode.metadata.title;
    this.size = [220, 120];

    this.addProperty("path", "", "string");
    this.addProperty("defaultValue", null, "any");

    this.addInput("onTrigger", LiteGraph.ACTION);
    this.addInput("object", "object");
    this.addInput("path", "string");
    this.addInput("default", "any");

    this.addOutput("completed", LiteGraph.EVENT);
    this.addOutput("value", "any");
    this.addOutput("string", "string");
    this.addOutput("number", "number");
    this.addOutput("boolean", "boolean");
    this.addOutput("found", "boolean");
    this.addOutput("path", "string");
    this.mode = LiteGraph.ON_TRIGGER;
  }

  mode = LiteGraph.ON_TRIGGER;
}
