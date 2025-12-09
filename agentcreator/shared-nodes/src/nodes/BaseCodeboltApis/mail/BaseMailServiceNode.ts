import { LGraphNode, LiteGraph } from '@codebolt/litegraph';

export class BaseMailServiceNode extends LGraphNode {
    constructor(title?: string, type?: string) {
        super(title, type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addOutput("onExecuted", LiteGraph.EVENT);
    }

    mode = LiteGraph.ON_TRIGGER;
}
