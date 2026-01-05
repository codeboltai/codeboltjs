import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

export class BaseCreateFileUpdateIntentNode extends LGraphNode {
    static metadata: NodeMetadata = { type: "codebolt/fileUpdateIntent/create", title: "Create File Update Intent", category: "codebolt/fileUpdateIntent", description: "Create a file update intent", icon: "📝", color: "#FF5722" };
    constructor() {
        super(BaseCreateFileUpdateIntentNode.metadata.title, BaseCreateFileUpdateIntentNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("files", "array");
        this.addInput("description", "string");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("intentId", "string");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

export class BaseListFileUpdateIntentsNode extends LGraphNode {
    static metadata: NodeMetadata = { type: "codebolt/fileUpdateIntent/list", title: "List File Update Intents", category: "codebolt/fileUpdateIntent", description: "List file update intents", icon: "📋", color: "#FF5722" };
    constructor() {
        super(BaseListFileUpdateIntentsNode.metadata.title, BaseListFileUpdateIntentsNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("intents", "array");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}
