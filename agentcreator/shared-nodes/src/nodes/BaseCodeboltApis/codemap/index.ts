import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

export class BaseGetCodemapNode extends LGraphNode {
    static metadata: NodeMetadata = { type: "codebolt/codemap/getCodemap", title: "Get Codemap", category: "codebolt/codemap", description: "Get project codemap", icon: "🗺️", color: "#009688" };
    constructor() {
        super(BaseGetCodemapNode.metadata.title, BaseGetCodemapNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("codemap", "object");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}
