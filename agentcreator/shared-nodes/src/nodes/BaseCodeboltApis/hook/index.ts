import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Hook Create Node
export class BaseHookCreateNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/hook/create",
        title: "Create Hook",
        category: "codebolt/hook",
        description: "Create a new hook",
        icon: "🪝",
        color: "#795548"
    };
    constructor() {
        super(BaseHookCreateNode.metadata.title, BaseHookCreateNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("config", "object");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("hook", "object");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

// Hook List Node
export class BaseHookListNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/hook/list",
        title: "List Hooks",
        category: "codebolt/hook",
        description: "List all hooks",
        icon: "📋",
        color: "#795548"
    };
    constructor() {
        super(BaseHookListNode.metadata.title, BaseHookListNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("hooks", "array");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

// Hook Enable Node
export class BaseHookEnableNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/hook/enable",
        title: "Enable Hook",
        category: "codebolt/hook",
        description: "Enable a hook",
        icon: "✅",
        color: "#795548"
    };
    constructor() {
        super(BaseHookEnableNode.metadata.title, BaseHookEnableNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("hookId", "string");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("hook", "object");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

// Hook Disable Node
export class BaseHookDisableNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/hook/disable",
        title: "Disable Hook",
        category: "codebolt/hook",
        description: "Disable a hook",
        icon: "⛔",
        color: "#795548"
    };
    constructor() {
        super(BaseHookDisableNode.metadata.title, BaseHookDisableNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("hookId", "string");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("hook", "object");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}
