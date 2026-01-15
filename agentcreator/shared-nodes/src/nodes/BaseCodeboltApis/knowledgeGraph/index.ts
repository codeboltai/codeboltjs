import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// KG Add Record Node
export class BaseKGAddRecordNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/knowledgeGraph/addRecord",
        title: "KG Add Record",
        category: "codebolt/knowledgeGraph",
        description: "Add a memory record to the knowledge graph",
        icon: "🔗",
        color: "#00BCD4"
    };
    constructor() {
        super(BaseKGAddRecordNode.metadata.title, BaseKGAddRecordNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("instanceId", "string");
        this.addInput("kind", "string");
        this.addInput("attributes", "object");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("record", "object");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

// KG List Records Node
export class BaseKGListRecordsNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/knowledgeGraph/listRecords",
        title: "KG List Records",
        category: "codebolt/knowledgeGraph",
        description: "List memory records from the knowledge graph",
        icon: "📋",
        color: "#00BCD4"
    };
    constructor() {
        super(BaseKGListRecordsNode.metadata.title, BaseKGListRecordsNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("instanceId", "string");
        this.addInput("kind", "string");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("records", "array");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

// KG Add Edge Node
export class BaseKGAddEdgeNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/knowledgeGraph/addEdge",
        title: "KG Add Edge",
        category: "codebolt/knowledgeGraph",
        description: "Add an edge to the knowledge graph",
        icon: "↔️",
        color: "#00BCD4"
    };
    constructor() {
        super(BaseKGAddEdgeNode.metadata.title, BaseKGAddEdgeNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("instanceId", "string");
        this.addInput("kind", "string");
        this.addInput("fromNodeId", "string");
        this.addInput("toNodeId", "string");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("edge", "object");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

// KG List Edges Node
export class BaseKGListEdgesNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/knowledgeGraph/listEdges",
        title: "KG List Edges",
        category: "codebolt/knowledgeGraph",
        description: "List edges from the knowledge graph",
        icon: "🔗",
        color: "#00BCD4"
    };
    constructor() {
        super(BaseKGListEdgesNode.metadata.title, BaseKGListEdgesNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("instanceId", "string");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("edges", "array");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

// KG Execute View Node
export class BaseKGExecuteViewNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/knowledgeGraph/executeView",
        title: "KG Execute View",
        category: "codebolt/knowledgeGraph",
        description: "Execute a knowledge graph view query",
        icon: "▶️",
        color: "#00BCD4"
    };
    constructor() {
        super(BaseKGExecuteViewNode.metadata.title, BaseKGExecuteViewNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("viewId", "string");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("result", "object");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}
