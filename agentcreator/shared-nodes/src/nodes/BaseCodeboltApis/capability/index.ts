import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

export class BaseListCapabilitiesNode extends LGraphNode {
    static metadata: NodeMetadata = { type: "codebolt/capability/listCapabilities", title: "List Capabilities", category: "codebolt/capability", description: "List agent capabilities", icon: "🎯", color: "#3F51B5" };
    constructor() {
        super(BaseListCapabilitiesNode.metadata.title, BaseListCapabilitiesNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("capabilities", "array");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

export class BaseRegisterCapabilityNode extends LGraphNode {
    static metadata: NodeMetadata = { type: "codebolt/capability/registerCapability", title: "Register Capability", category: "codebolt/capability", description: "Register a capability", icon: "➕", color: "#3F51B5" };
    constructor() {
        super(BaseRegisterCapabilityNode.metadata.title, BaseRegisterCapabilityNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("capability", "object");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}
