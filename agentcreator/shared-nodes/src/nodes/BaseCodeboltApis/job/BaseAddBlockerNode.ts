import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base AddBlocker Node
export class BaseAddBlockerNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/job/addblocker",
        title: "Add Blocker",
        category: "codebolt/job",
        description: "Adds a blocker to a job using codebolt.job.addBlocker",
        icon: "🚧",
        color: "#F44336"
    };

    constructor() {
        super(BaseAddBlockerNode.metadata.title, BaseAddBlockerNode.metadata.type);
        this.title = BaseAddBlockerNode.metadata.title;
        this.size = [220, 160];

        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("jobId", "string");
        this.addInput("text", "string");
        this.addInput("addedBy", "string");
        this.addInput("blockerJobIds", "array");

        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("job", "object");
        this.addOutput("success", "boolean");
    }

    mode = LiteGraph.ON_TRIGGER;
}
