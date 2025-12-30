import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base AddBid Node
export class BaseAddBidNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/job/addbid",
        title: "Add Bid",
        category: "codebolt/job",
        description: "Adds a bid on a job using codebolt.job.addBid",
        icon: "🎯",
        color: "#E91E63"
    };

    constructor() {
        super(BaseAddBidNode.metadata.title, BaseAddBidNode.metadata.type);
        this.title = BaseAddBidNode.metadata.title;
        this.size = [220, 160];

        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("jobId", "string");
        this.addInput("agentId", "string");
        this.addInput("agentName", "string");
        this.addInput("reason", "string");
        this.addInput("priority", "number");

        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("job", "object");
        this.addOutput("success", "boolean");
    }

    mode = LiteGraph.ON_TRIGGER;
}
