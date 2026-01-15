import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

export class BaseCreateEventNode extends LGraphNode {
    static metadata: NodeMetadata = { type: "codebolt/calendar/createEvent", title: "Create Calendar Event", category: "codebolt/calendar", description: "Create a calendar event", icon: "📅", color: "#E91E63" };
    constructor() {
        super(BaseCreateEventNode.metadata.title, BaseCreateEventNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("title", "string");
        this.addInput("startTime", "string");
        this.addInput("eventType", "string");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("event", "object");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

export class BaseListEventsNode extends LGraphNode {
    static metadata: NodeMetadata = { type: "codebolt/calendar/listEvents", title: "List Calendar Events", category: "codebolt/calendar", description: "List calendar events", icon: "📋", color: "#E91E63" };
    constructor() {
        super(BaseListEventsNode.metadata.title, BaseListEventsNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("events", "array");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

export class BaseGetUpcomingEventsNode extends LGraphNode {
    static metadata: NodeMetadata = { type: "codebolt/calendar/getUpcomingEvents", title: "Get Upcoming Events", category: "codebolt/calendar", description: "Get upcoming calendar events", icon: "⏰", color: "#E91E63" };
    constructor() {
        super(BaseGetUpcomingEventsNode.metadata.title, BaseGetUpcomingEventsNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("withinMinutes", "number");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("events", "array");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

export class BaseMarkEventCompleteNode extends LGraphNode {
    static metadata: NodeMetadata = { type: "codebolt/calendar/markEventComplete", title: "Mark Event Complete", category: "codebolt/calendar", description: "Mark a calendar event as complete", icon: "✅", color: "#E91E63" };
    constructor() {
        super(BaseMarkEventCompleteNode.metadata.title, BaseMarkEventCompleteNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("eventId", "string");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

export class BaseDeleteEventNode extends LGraphNode {
    static metadata: NodeMetadata = { type: "codebolt/calendar/deleteEvent", title: "Delete Calendar Event", category: "codebolt/calendar", description: "Delete a calendar event", icon: "🗑️", color: "#E91E63" };
    constructor() {
        super(BaseDeleteEventNode.metadata.title, BaseDeleteEventNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("eventId", "string");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}
