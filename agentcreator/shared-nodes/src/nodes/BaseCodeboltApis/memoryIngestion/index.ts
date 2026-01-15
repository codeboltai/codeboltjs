import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Ingestion Execute Node
export class BaseIngestionExecuteNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/memoryIngestion/execute",
        title: "Execute Ingestion",
        category: "codebolt/memoryIngestion",
        description: "Execute a memory ingestion pipeline",
        icon: "📥",
        color: "#673AB7"
    };
    constructor() {
        super(BaseIngestionExecuteNode.metadata.title, BaseIngestionExecuteNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("pipelineId", "string");
        this.addInput("eventData", "object");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("result", "object");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

// Ingestion List Node
export class BaseIngestionListNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/memoryIngestion/list",
        title: "List Ingestion Pipelines",
        category: "codebolt/memoryIngestion",
        description: "List all memory ingestion pipelines",
        icon: "📋",
        color: "#673AB7"
    };
    constructor() {
        super(BaseIngestionListNode.metadata.title, BaseIngestionListNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("pipelines", "array");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

// Ingestion Activate Node
export class BaseIngestionActivateNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/memoryIngestion/activate",
        title: "Activate Ingestion",
        category: "codebolt/memoryIngestion",
        description: "Activate an ingestion pipeline",
        icon: "▶️",
        color: "#673AB7"
    };
    constructor() {
        super(BaseIngestionActivateNode.metadata.title, BaseIngestionActivateNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("pipelineId", "string");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("pipeline", "object");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

// Ingestion Disable Node
export class BaseIngestionDisableNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/memoryIngestion/disable",
        title: "Disable Ingestion",
        category: "codebolt/memoryIngestion",
        description: "Disable an ingestion pipeline",
        icon: "⏸️",
        color: "#673AB7"
    };
    constructor() {
        super(BaseIngestionDisableNode.metadata.title, BaseIngestionDisableNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("pipelineId", "string");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("pipeline", "object");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}
