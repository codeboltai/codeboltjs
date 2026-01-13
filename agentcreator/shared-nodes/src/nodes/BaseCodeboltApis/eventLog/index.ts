import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Append Event Node
export class BaseAppendEventNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/eventLog/appendEvent",
        title: "Append Event",
        category: "codebolt/eventLog",
        description: "Append an event to the event log",
        icon: "📝",
        color: "#4CAF50"
    };
    constructor() {
        super(BaseAppendEventNode.metadata.title, BaseAppendEventNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("instanceId", "string");
        this.addInput("eventType", "string");
        this.addInput("payload", "object");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("event", "object");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

// Query Events Node
export class BaseQueryEventsNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/eventLog/queryEvents",
        title: "Query Events",
        category: "codebolt/eventLog",
        description: "Query events from the event log using DSL",
        icon: "🔍",
        color: "#4CAF50"
    };
    constructor() {
        super(BaseQueryEventsNode.metadata.title, BaseQueryEventsNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("query", "object");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("result", "object");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

// Event Log List Instances Node
export class BaseEventLogListInstancesNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/eventLog/listInstances",
        title: "List Event Log Instances",
        category: "codebolt/eventLog",
        description: "List all event log instances",
        icon: "📋",
        color: "#4CAF50"
    };
    constructor() {
        super(BaseEventLogListInstancesNode.metadata.title, BaseEventLogListInstancesNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("instances", "array");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}
