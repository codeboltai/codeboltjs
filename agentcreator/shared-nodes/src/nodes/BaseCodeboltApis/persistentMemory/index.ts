import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Persistent Memory Execute Node
export class BasePersistentMemoryExecuteNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/persistentMemory/execute",
        title: "Execute Memory Retrieval",
        category: "codebolt/persistentMemory",
        description: "Execute a persistent memory retrieval pipeline",
        icon: "💾",
        color: "#9C27B0"
    };
    constructor() {
        super(BasePersistentMemoryExecuteNode.metadata.title, BasePersistentMemoryExecuteNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("memoryId", "string");
        this.addInput("intent", "object");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("result", "object");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

// Persistent Memory List Node
export class BasePersistentMemoryListNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/persistentMemory/list",
        title: "List Persistent Memories",
        category: "codebolt/persistentMemory",
        description: "List all persistent memory configurations",
        icon: "📋",
        color: "#9C27B0"
    };
    constructor() {
        super(BasePersistentMemoryListNode.metadata.title, BasePersistentMemoryListNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("memories", "array");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

// Persistent Memory Get Node
export class BasePersistentMemoryGetNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/persistentMemory/get",
        title: "Get Persistent Memory",
        category: "codebolt/persistentMemory",
        description: "Get a persistent memory configuration by ID",
        icon: "📖",
        color: "#9C27B0"
    };
    constructor() {
        super(BasePersistentMemoryGetNode.metadata.title, BasePersistentMemoryGetNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("memoryId", "string");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("memory", "object");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}
