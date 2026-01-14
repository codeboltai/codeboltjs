import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Get Context Node
export class BaseGetContextNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/contextAssembly/getContext",
        title: "Get Context",
        category: "codebolt/contextAssembly",
        description: "Assemble context from memory sources",
        icon: "🧩",
        color: "#3F51B5"
    };
    constructor() {
        super(BaseGetContextNode.metadata.title, BaseGetContextNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("request", "object");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("context", "object");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

// List Memory Types Node
export class BaseListMemoryTypesNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/contextAssembly/listMemoryTypes",
        title: "List Memory Types",
        category: "codebolt/contextAssembly",
        description: "List available memory types for context assembly",
        icon: "📋",
        color: "#3F51B5"
    };
    constructor() {
        super(BaseListMemoryTypesNode.metadata.title, BaseListMemoryTypesNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("memoryTypes", "array");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

// Evaluate Rules Node
export class BaseContextEvaluateRulesNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/contextAssembly/evaluateRules",
        title: "Evaluate Context Rules",
        category: "codebolt/contextAssembly",
        description: "Evaluate context assembly rules",
        icon: "⚖️",
        color: "#3F51B5"
    };
    constructor() {
        super(BaseContextEvaluateRulesNode.metadata.title, BaseContextEvaluateRulesNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("request", "object");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("evaluation", "object");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}
