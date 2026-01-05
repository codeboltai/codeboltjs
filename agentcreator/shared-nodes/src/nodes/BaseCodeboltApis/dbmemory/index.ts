import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

export class BaseSaveToDbMemoryNode extends LGraphNode {
    static metadata: NodeMetadata = { type: "codebolt/dbmemory/save", title: "Save to DB Memory", category: "codebolt/dbmemory", description: "Save data to database memory", icon: "💾", color: "#673AB7" };
    constructor() {
        super(BaseSaveToDbMemoryNode.metadata.title, BaseSaveToDbMemoryNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("key", "string");
        this.addInput("value", "any");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

export class BaseGetFromDbMemoryNode extends LGraphNode {
    static metadata: NodeMetadata = { type: "codebolt/dbmemory/get", title: "Get from DB Memory", category: "codebolt/dbmemory", description: "Get data from database memory", icon: "📖", color: "#673AB7" };
    constructor() {
        super(BaseGetFromDbMemoryNode.metadata.title, BaseGetFromDbMemoryNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("key", "string");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("value", "any");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}
