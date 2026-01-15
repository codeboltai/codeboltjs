import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

export class BaseCreateThreadNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/thread/createThread",
        title: "Create Thread",
        category: "codebolt/thread",
        description: "Creates a new conversation thread",
        icon: "🧵",
        color: "#9C27B0"
    };
    constructor() {
        super(BaseCreateThreadNode.metadata.title, BaseCreateThreadNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("title", "string");
        this.addInput("agentId", "string");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("thread", "object");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

export class BaseGetThreadListNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/thread/getThreadList",
        title: "Get Thread List",
        category: "codebolt/thread",
        description: "Gets list of threads",
        icon: "📋",
        color: "#9C27B0"
    };
    constructor() {
        super(BaseGetThreadListNode.metadata.title, BaseGetThreadListNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("threads", "array");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

export class BaseGetThreadDetailNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/thread/getThreadDetail",
        title: "Get Thread Detail",
        category: "codebolt/thread",
        description: "Gets details of a specific thread",
        icon: "🔍",
        color: "#9C27B0"
    };
    constructor() {
        super(BaseGetThreadDetailNode.metadata.title, BaseGetThreadDetailNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("threadId", "string");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("thread", "object");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

export class BaseStartThreadNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/thread/startThread",
        title: "Start Thread",
        category: "codebolt/thread",
        description: "Starts a thread",
        icon: "▶️",
        color: "#9C27B0"
    };
    constructor() {
        super(BaseStartThreadNode.metadata.title, BaseStartThreadNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("threadId", "string");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

export class BaseUpdateThreadNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/thread/updateThread",
        title: "Update Thread",
        category: "codebolt/thread",
        description: "Updates a thread",
        icon: "✏️",
        color: "#9C27B0"
    };
    constructor() {
        super(BaseUpdateThreadNode.metadata.title, BaseUpdateThreadNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("threadId", "string");
        this.addInput("updates", "object");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("thread", "object");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

export class BaseDeleteThreadNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/thread/deleteThread",
        title: "Delete Thread",
        category: "codebolt/thread",
        description: "Deletes a thread",
        icon: "🗑️",
        color: "#9C27B0"
    };
    constructor() {
        super(BaseDeleteThreadNode.metadata.title, BaseDeleteThreadNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("threadId", "string");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

export class BaseGetThreadMessagesNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/thread/getThreadMessages",
        title: "Get Thread Messages",
        category: "codebolt/thread",
        description: "Gets messages for a thread",
        icon: "💬",
        color: "#9C27B0"
    };
    constructor() {
        super(BaseGetThreadMessagesNode.metadata.title, BaseGetThreadMessagesNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("threadId", "string");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("messages", "array");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}
