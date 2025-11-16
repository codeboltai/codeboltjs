import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

export abstract class BaseAgentServiceNode extends LGraphNode {
  protected constructor(metadata: NodeMetadata, size: [number, number] = [300, 160]) {
    super(metadata.title, metadata.type);
    this.title = metadata.title;
    this.size = size;

    this.addInput("onTrigger", LiteGraph.ACTION);
    this.addOutput("completed", LiteGraph.EVENT);
    this.addOutput("response", "object");
    this.addOutput("success", "boolean");

    this.mode = LiteGraph.ON_TRIGGER;
  }
}
