import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// KV Store Set Node
export class BaseKVSetNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/kvStore/set",
        title: "KV Set",
        category: "codebolt/kvStore",
        description: "Set a value in the KV store",
        icon: "🗄️",
        color: "#FF9800"
    };
    constructor() {
        super(BaseKVSetNode.metadata.title, BaseKVSetNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("instanceId", "string");
        this.addInput("namespace", "string");
        this.addInput("key", "string");
        this.addInput("value", 0 as any);
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("record", "object");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

// KV Store Get Node
export class BaseKVGetNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/kvStore/get",
        title: "KV Get",
        category: "codebolt/kvStore",
        description: "Get a value from the KV store",
        icon: "📖",
        color: "#FF9800"
    };
    constructor() {
        super(BaseKVGetNode.metadata.title, BaseKVGetNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("instanceId", "string");
        this.addInput("namespace", "string");
        this.addInput("key", "string");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("value", 0 as any);
        this.addOutput("exists", "boolean");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

// KV Store Delete Node
export class BaseKVDeleteNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/kvStore/delete",
        title: "KV Delete",
        category: "codebolt/kvStore",
        description: "Delete a value from the KV store",
        icon: "🗑️",
        color: "#FF9800"
    };
    constructor() {
        super(BaseKVDeleteNode.metadata.title, BaseKVDeleteNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("instanceId", "string");
        this.addInput("namespace", "string");
        this.addInput("key", "string");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("deleted", "boolean");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

// KV Store Query Node
export class BaseKVQueryNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/kvStore/query",
        title: "KV Query",
        category: "codebolt/kvStore",
        description: "Query the KV store using DSL",
        icon: "🔍",
        color: "#FF9800"
    };
    constructor() {
        super(BaseKVQueryNode.metadata.title, BaseKVQueryNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("query", "object");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("result", "object");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

// KV Store List Instances Node
export class BaseKVListInstancesNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/kvStore/listInstances",
        title: "KV List Instances",
        category: "codebolt/kvStore",
        description: "List all KV store instances",
        icon: "📋",
        color: "#FF9800"
    };
    constructor() {
        super(BaseKVListInstancesNode.metadata.title, BaseKVListInstancesNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("instances", "array");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}
