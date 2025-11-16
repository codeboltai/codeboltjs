import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

export abstract class BaseGitNode extends LGraphNode {
  protected constructor(metadata: NodeMetadata, size: [number, number] = [260, 140]) {
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
